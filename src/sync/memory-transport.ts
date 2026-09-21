import type { SyncMessage } from './messages'
import type { RelayInfo, RoomTransport } from './transport'

type MessageHandler = (message: SyncMessage, fromPeerId: string) => void
type PeerHandler = (peerId: string) => void

/**
 * 内存总线：同一进程内多个传输实例通过它互相可见，用于单元与集成测试。
 * 语义与真实传输一致：入房后彼此触发 onPeerJoin，离开触发 onPeerLeave。
 */
export class MemoryHub {
  private readonly rooms = new Map<string, Set<MemoryTransport>>()

  members(roomId: string): Set<MemoryTransport> {
    let set = this.rooms.get(roomId)
    if (!set) {
      set = new Set()
      this.rooms.set(roomId, set)
    }
    return set
  }

  createTransport(selfId: string): MemoryTransport {
    return new MemoryTransport(this, selfId)
  }
}

export class MemoryTransport implements RoomTransport {
  private roomId: string | null = null
  private readonly messageHandlers = new Set<MessageHandler>()
  private readonly joinHandlers = new Set<PeerHandler>()
  private readonly leaveHandlers = new Set<PeerHandler>()

  constructor(
    private readonly hub: MemoryHub,
    readonly selfId: string,
  ) {}

  async join(roomId: string): Promise<void> {
    if (this.roomId) await this.leave()
    this.roomId = roomId
    const members = this.hub.members(roomId)
    // 先加入成员表再通知，保证双方在 onPeerJoin 回调里就能互相定向发送
    members.add(this)
    for (const other of members) {
      if (other === this) continue
      other.joinHandlers.forEach((handler) => handler(this.selfId))
      this.joinHandlers.forEach((handler) => handler(other.selfId))
    }
  }

  async leave(): Promise<void> {
    if (!this.roomId) return
    const members = this.hub.members(this.roomId)
    members.delete(this)
    for (const other of members) {
      other.leaveHandlers.forEach((handler) => handler(this.selfId))
    }
    this.roomId = null
  }

  send(message: SyncMessage, target?: string): void {
    if (!this.roomId) return
    // 与真实传输一致：经过 JSON 序列化，接收方拿到的是脱离响应式代理的普通对象
    const payload = JSON.parse(JSON.stringify(message)) as SyncMessage
    for (const other of this.hub.members(this.roomId)) {
      if (other === this) continue
      if (target && other.selfId !== target) continue
      other.messageHandlers.forEach((handler) => handler(payload, this.selfId))
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onPeerJoin(handler: PeerHandler): () => void {
    this.joinHandlers.add(handler)
    return () => this.joinHandlers.delete(handler)
  }

  onPeerLeave(handler: PeerHandler): () => void {
    this.leaveHandlers.add(handler)
    return () => this.leaveHandlers.delete(handler)
  }

  peers(): string[] {
    if (!this.roomId) return []
    return [...this.hub.members(this.roomId)].filter((t) => t !== this).map((t) => t.selfId)
  }

  relays(): RelayInfo[] {
    return [{ url: 'memory://hub', state: this.roomId ? 'open' : 'closed' }]
  }
}
