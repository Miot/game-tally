import {
  selfId,
  type JoinRoom,
  type JsonValue,
  type MessageAction,
  type Room,
} from '@trystero-p2p/mqtt'

import type { NetworkSettings } from '@/stores/settings'

import type { SyncMessage } from './messages'
import type { RelayInfo, RoomTransport } from './transport'

/** 与其它使用相同公共中继的应用隔离命名空间 */
export const APP_ID = 'gametally-v1'

/** MQTT 中继：大陆节点在前，境外节点补充冗余 */
export const MQTT_RELAY_URLS = [
  'wss://broker-cn.emqx.io:8084/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://test.mosquitto.org:8081/mqtt',
]

type MessageHandler = (message: SyncMessage, fromPeerId: string) => void
type PeerHandler = (peerId: string) => void

const READY_STATE_NAMES: Record<number, RelayInfo['state']> = {
  0: 'connecting',
  1: 'open',
  2: 'closing',
  3: 'closed',
}

interface StrategyModule {
  joinRoom: JoinRoom
  getRelaySockets: () => Record<string, WebSocket | undefined>
}

/** 按需加载信令策略，避免首屏同时打包 MQTT 与 Nostr 两套客户端 */
async function loadStrategy(strategy: NetworkSettings['strategy']): Promise<StrategyModule> {
  const module =
    strategy === 'nostr' ? await import('trystero') : await import('@trystero-p2p/mqtt')
  return {
    joinRoom: module.joinRoom as JoinRoom,
    getRelaySockets: module.getRelaySockets as StrategyModule['getRelaySockets'],
  }
}

export function createTrysteroTransport(settings: NetworkSettings): RoomTransport {
  const useNostr = settings.strategy === 'nostr'

  let strategy: StrategyModule | null = null
  let room: Room | null = null
  let action: MessageAction<JsonValue> | null = null
  const messageHandlers = new Set<MessageHandler>()
  const joinHandlers = new Set<PeerHandler>()
  const leaveHandlers = new Set<PeerHandler>()

  return {
    selfId,

    async join(roomId) {
      if (room) await this.leave()
      strategy ??= await loadStrategy(settings.strategy)
      const { joinRoom } = strategy
      const turnConfig = settings.turnServers
        .filter((server) => server.urls.trim().length > 0)
        .map((server) => ({
          urls: server.urls.trim(),
          username: server.username || undefined,
          credential: server.credential || undefined,
        }))
      room = joinRoom(
        {
          appId: APP_ID,
          rtcConfig: { iceServers: settings.stunUrls.map((urls) => ({ urls })) },
          turnConfig,
          relayConfig: useNostr
            ? {}
            : { urls: MQTT_RELAY_URLS, redundancy: MQTT_RELAY_URLS.length },
        },
        roomId,
        {
          onJoinError: (details) => console.warn('入房失败', details),
        },
      )
      action = room.makeAction<JsonValue>('sync')
      action.onMessage = (data, { peerId }) => {
        const message = data as unknown as SyncMessage
        messageHandlers.forEach((handler) => handler(message, peerId))
      }
      room.onPeerJoin = (peerId) => joinHandlers.forEach((handler) => handler(peerId))
      room.onPeerLeave = (peerId) => leaveHandlers.forEach((handler) => handler(peerId))
    },

    async leave() {
      const current = room
      room = null
      action = null
      if (current) await current.leave()
    },

    send(message, target) {
      if (!action) return
      void action.send(message as unknown as JsonValue, target ? { target } : undefined)
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
      return room ? Object.keys(room.getPeers()) : []
    },

    relays() {
      if (!strategy) return []
      const sockets = strategy.getRelaySockets() ?? {}
      return Object.entries(sockets).map(([url, socket]) => ({
        url,
        state: READY_STATE_NAMES[socket?.readyState ?? 3] ?? 'closed',
      }))
    },
  }
}
