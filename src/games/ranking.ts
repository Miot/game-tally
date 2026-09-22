import type { CounterId } from './types'

/** 参与排名所需的最小形状，`PlayerState` 天然满足 */
export interface RankableState {
  playerId: string
  counters: Record<CounterId, number>
}

/**
 * 按指定计数器算名次。
 *
 * 并列采用竞赛排名：数值相同者同名次，其后跳号（1、2、2、4），这是桌游计分的通行做法。
 * 入参顺序无关紧要，函数自己排序，因此计分表（按入房顺序）与合计页（按名次顺序）可以共用。
 */
export function computeRanks(
  players: readonly RankableState[],
  counterId: CounterId,
  order: 'desc' | 'asc' = 'desc',
): Map<string, number> {
  const sign = order === 'desc' ? -1 : 1
  const sorted = [...players].sort(
    (a, b) => sign * ((a.counters[counterId] ?? 0) - (b.counters[counterId] ?? 0)),
  )

  const ranks = new Map<string, number>()
  let lastValue: number | null = null
  let lastRank = 0

  sorted.forEach((player, index) => {
    const value = player.counters[counterId] ?? 0
    const rank = value === lastValue ? lastRank : index + 1
    ranks.set(player.playerId, rank)
    lastValue = value
    lastRank = rank
  })

  return ranks
}
