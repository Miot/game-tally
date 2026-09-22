import { describe, expect, it } from 'vitest'

import { computeRanks, type RankableState } from './ranking'

function player(playerId: string, survivors: number): RankableState {
  return { playerId, counters: { survivors } }
}

describe('名次计算', () => {
  it('按计数器降序给出名次', () => {
    const ranks = computeRanks([player('a', 12), player('b', 30), player('c', 21)], 'survivors')
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('c')).toBe(2)
    expect(ranks.get('a')).toBe(3)
  })

  it('入参顺序不影响结果', () => {
    const list = [player('a', 12), player('b', 30), player('c', 21)]
    const forward = computeRanks(list, 'survivors')
    const backward = computeRanks([...list].reverse(), 'survivors')
    expect([...backward.entries()].sort()).toEqual([...forward.entries()].sort())
  })

  it('数值相同者并列，其后跳号', () => {
    const ranks = computeRanks(
      [player('a', 24), player('b', 30), player('c', 24), player('d', 9)],
      'survivors',
    )
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('a')).toBe(2)
    expect(ranks.get('c')).toBe(2)
    // 两人并列第 2，下一名是第 4 而不是第 3
    expect(ranks.get('d')).toBe(4)
  })

  it('全员同分时所有人都是第 1', () => {
    const ranks = computeRanks([player('a', 7), player('b', 7), player('c', 7)], 'survivors')
    expect([...ranks.values()]).toEqual([1, 1, 1])
  })

  it('缺失的计数器按 0 处理，出局者排在最后', () => {
    const ranks = computeRanks(
      [{ playerId: 'a', counters: {} }, player('b', 3), player('c', 0)],
      'survivors',
    )
    expect(ranks.get('b')).toBe(1)
    // a 与 c 都是 0，并列第 2
    expect(ranks.get('a')).toBe(2)
    expect(ranks.get('c')).toBe(2)
  })

  it('升序排名用于以少为胜的游戏', () => {
    const ranks = computeRanks([player('a', 12), player('b', 3)], 'survivors', 'asc')
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('a')).toBe(2)
  })

  it('空名单返回空表', () => {
    expect(computeRanks([], 'survivors').size).toBe(0)
  })
})
