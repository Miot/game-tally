import { describe, expect, it } from 'vitest'

import { mergePlayerState, type PlayerState } from './messages'

const base: PlayerState = {
  playerId: 'p1',
  name: '阿波罗',
  avatar: 0,
  counters: { survivors: 30, money: 4, food: 4 },
  version: 3,
  updatedAt: 1000,
}

describe('mergePlayerState', () => {
  it('没有本地状态时直接采用来者', () => {
    expect(mergePlayerState(undefined, base)).toBe(base)
  })

  it('版本更高者胜出', () => {
    const newer = { ...base, version: 4, counters: { ...base.counters, money: 8 } }
    expect(mergePlayerState(base, newer)).toBe(newer)
    expect(mergePlayerState(newer, base)).toBe(newer)
  })

  it('版本相同时以更新时间为准', () => {
    const later = { ...base, updatedAt: 2000 }
    expect(mergePlayerState(base, later)).toBe(later)
    expect(mergePlayerState(later, base)).toBe(later)
  })

  it('版本与时间都相同时保留本地状态', () => {
    const same = { ...base }
    expect(mergePlayerState(base, same)).toBe(base)
  })
})
