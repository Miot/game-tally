import mqtt, { type MqttClient } from 'mqtt'

import type { SyncMessage } from './messages'
import type { RoomTransport } from './transport'

/**
 * 经公共 MQTT 中继直接转发计分数据。
 *
 * 不走 WebRTC：手机蜂窝网络的运营商 NAT 基本是对称型，纯 P2P 必然打洞失败，
 * 而唯一的解法 TURN 中转没有可用的免费公共服务。计分数据每条仅数百字节，
 * 直接过中继既省掉 NAT 穿透，也让任意网络组合都能连上。
 *
 * 同时连多个中继做冗余，因此收到的消息按 id 去重。
 */

/** 与其它使用相同公共中继的应用隔离命名空间 */
export const TOPIC_PREFIX = 'gametally/v1'

/** 大陆节点在前，其余作为冗余 */
export const DEFAULT_BROKERS = [
  'wss://broker-cn.emqx.io:8084/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
]

/** 心跳间隔与判定离线的静默时长 */
export const HEARTBEAT_MS = 8_000
export const PEER_TIMEOUT_MS = 26_000
const SEEN_LIMIT = 400

type Wire =
  | { k: 'join'; f: string; i: string }
  | { k: 'beat'; f: string; i: string }
  | { k: 'bye'; f: string; i: string }
  | { k: 'msg'; f: string; i: string; t?: string; b: SyncMessage }

type MessageHandler = (message: SyncMessage, fromPeerId: string) => void
type PeerHandler = (peerId: string) => void

export function createMqttTransport(brokers: string[] = DEFAULT_BROKERS): RoomTransport {
  const selfId = crypto.randomUUID()
  const messageHandlers = new Set<MessageHandler>()
  const joinHandlers = new Set<PeerHandler>()
  const leaveHandlers = new Set<PeerHandler>()

  let clients: Array<{ url: string; client: MqttClient }> = []
  let topic = ''
  let seq = 0
  /** peerId → 最后一次收到其消息的时间 */
  const lastSeen = new Map<string, number>()
  /** 已处理过的消息 id，用于多中继去重 */
  const seen = new Set<string>()
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let sweeper: ReturnType<typeof setInterval> | null = null

  function nextId(): string {
    seq += 1
    return `${selfId}-${seq}`
  }

  function publish(wire: Wire): void {
    const payload = JSON.stringify(wire)
    for (const { client } of clients) {
      if (client.connected) client.publish(topic, payload, { qos: 0 })
    }
  }

  function remember(id: string): boolean {
    if (seen.has(id)) return false
    seen.add(id)
    if (seen.size > SEEN_LIMIT) {
      // Set 保持插入顺序，丢掉最早的一批即可
      for (const old of [...seen].slice(0, seen.size - SEEN_LIMIT)) seen.delete(old)
    }
    return true
  }

  /** 首次见到某个对等端时通知上层，并回一次心跳让对方也能立刻发现我 */
  function touch(peerId: string, announceBack: boolean): void {
    const known = lastSeen.has(peerId)
    lastSeen.set(peerId, Date.now())
    if (!known) {
      if (announceBack) publish({ k: 'beat', f: selfId, i: nextId() })
      joinHandlers.forEach((handler) => handler(peerId))
    }
  }

  function handlePayload(raw: string): void {
    let wire: Wire
    try {
      wire = JSON.parse(raw) as Wire
    } catch {
      return
    }
    if (!wire || typeof wire.f !== 'string' || wire.f === selfId) return
    if (!remember(wire.i)) return

    if (wire.k === 'bye') {
      if (lastSeen.delete(wire.f)) leaveHandlers.forEach((handler) => handler(wire.f))
      return
    }
    // join 需要回应，让先入房的一方立刻认识新来的
    touch(wire.f, wire.k === 'join')
    if (wire.k === 'msg') {
      if (wire.t && wire.t !== selfId) return
      messageHandlers.forEach((handler) => handler(wire.b, wire.f))
    }
  }

  function sweep(): void {
    const deadline = Date.now() - PEER_TIMEOUT_MS
    for (const [peerId, at] of lastSeen) {
      if (at < deadline) {
        lastSeen.delete(peerId)
        leaveHandlers.forEach((handler) => handler(peerId))
      }
    }
  }

  return {
    selfId,

    async join(roomId) {
      await this.leave()
      topic = `${TOPIC_PREFIX}/${roomId}`

      clients = brokers.map((url) => ({
        url,
        client: mqtt.connect(url, {
          reconnectPeriod: 4_000,
          connectTimeout: 10_000,
          queueQoSZero: false,
          resubscribe: true,
          // 异常断开时由中继代发下线通知
          will: {
            topic,
            payload: JSON.stringify({ k: 'bye', f: selfId, i: `${selfId}-will` }),
            qos: 0,
            retain: false,
          },
        }),
      }))

      for (const { client } of clients) {
        client.on('message', (_topic, buffer) => handlePayload(buffer.toString()))
        client.on('error', () => undefined)
        client.on('connect', () => {
          client.subscribe(topic, { qos: 0 }, (error) => {
            if (!error) publish({ k: 'join', f: selfId, i: nextId() })
          })
        })
      }

      // 任一中继连上即可开始收发，不必等齐
      await Promise.race([
        Promise.any(
          clients.map(
            ({ client }) =>
              new Promise<void>((resolve, reject) => {
                if (client.connected) return resolve()
                client.once('connect', () => resolve())
                client.once('error', reject)
              }),
          ),
        ).catch(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 6_000)),
      ])

      heartbeat = setInterval(() => publish({ k: 'beat', f: selfId, i: nextId() }), HEARTBEAT_MS)
      sweeper = setInterval(sweep, HEARTBEAT_MS / 2)
    },

    async leave() {
      if (heartbeat) {
        clearInterval(heartbeat)
        heartbeat = null
      }
      if (sweeper) {
        clearInterval(sweeper)
        sweeper = null
      }
      if (clients.length > 0) {
        publish({ k: 'bye', f: selfId, i: nextId() })
        const closing = clients
        clients = []
        await Promise.all(closing.map(({ client }) => client.endAsync(true).catch(() => undefined)))
      }
      lastSeen.clear()
      seen.clear()
    },

    send(message, target) {
      publish({ k: 'msg', f: selfId, i: nextId(), t: target, b: message })
    },

    onMessage(handler) {
      messageHandlers.add(handler)
      return () => messageHandlers.delete(handler)
    },

    onPeerJoin(handler) {
      joinHandlers.add(handler)
      return () => joinHandlers.delete(handler)
    },

    onPeerLeave(handler) {
      leaveHandlers.add(handler)
      return () => leaveHandlers.delete(handler)
    },

    peers() {
      return [...lastSeen.keys()]
    },

    relays() {
      // 用 mqtt.js 自己的连接标志，浏览器端拿不到底层 socket 的 readyState
      return clients.map(({ url, client }) => ({
        url,
        state: client.connected
          ? ('open' as const)
          : client.disconnecting
            ? ('closing' as const)
            : client.reconnecting
              ? ('connecting' as const)
              : ('connecting' as const),
      }))
    },
  }
}
