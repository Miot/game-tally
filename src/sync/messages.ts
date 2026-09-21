import type { CounterId } from '@/games'

/** 单个玩家的完整状态，只有本人可以修改，其余对等端只读 */
export interface PlayerState {
  playerId: string
  name: string
  /** 机器人头像配色索引 */
  avatar: number
  counters: Record<CounterId, number>
  /** 本人每次修改 +1，接收方只接受更大的版本 */
  version: number
  updatedAt: number
  lastChange?: { counterId: CounterId; delta: number; at: number }
}

export type SyncMessage =
  | { type: 'state'; state: PlayerState }
  /** 对新入房的对等端推送所有已知状态；from 为发送方自己的 playerId，用于在线标记 */
  | { type: 'snapshot'; from: string; states: PlayerState[] }

/**
 * 版本合并：版本号大者胜，版本相同时以更新时间为准。
 * 返回值为应当保留的状态，便于调用方判断是否需要更新。
 */
export function mergePlayerState(
  current: PlayerState | undefined,
  incoming: PlayerState,
): PlayerState {
  if (!current) return incoming
  if (incoming.version > current.version) return incoming
  if (incoming.version === current.version && incoming.updatedAt > current.updatedAt) {
    return incoming
  }
  return current
}
