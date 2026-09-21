import type { SyncMessage } from './messages'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface RelayInfo {
  url: string
  /** WebSocket readyState 的语义化描述 */
  state: 'connecting' | 'open' | 'closing' | 'closed'
}

/**
 * 房间传输层：屏蔽底层 P2P 库，业务只关心「广播 / 定向发送 / 对等端进出」。
 * 生产实现走公共 MQTT 中继，测试实现为内存总线。
 */
export interface RoomTransport {
  readonly selfId: string
  join(roomId: string): Promise<void>
  leave(): Promise<void>
  send(message: SyncMessage, target?: string): void
  onMessage(handler: (message: SyncMessage, fromPeerId: string) => void): () => void
  onPeerJoin(handler: (peerId: string) => void): () => void
  onPeerLeave(handler: (peerId: string) => void): () => void
  peers(): string[]
  relays(): RelayInfo[]
}
