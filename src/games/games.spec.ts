import { describe, expect, it } from 'vitest'

import { assertGameDefinition, defaultGame, games, getGame, initialCounters } from './index'
import { moonColonyBloodbath } from './moon-colony-bloodbath'

describe('游戏定义注册表', () => {
  it('默认游戏为《月球殖民地》且已注册', () => {
    expect(defaultGame.id).toBe('moon-colony-bloodbath')
    expect(games.get('moon-colony-bloodbath')).toBe(moonColonyBloodbath)
    expect(getGame('moon-colony-bloodbath').name.en).toBe('Moon Colony Bloodbath')
  })

  it('查询未知游戏时抛出错误', () => {
    expect(() => getGame('nope')).toThrow('未知游戏')
  })

  it('《月球殖民地》只记录幸存者、钱、食物三项，且幸存者为主计数器', () => {
    expect(moonColonyBloodbath.counters.map((c) => c.id)).toEqual(['survivors', 'money', 'food'])
    expect(moonColonyBloodbath.counters.find((c) => c.hero)?.id).toBe('survivors')
    expect(initialCounters(moonColonyBloodbath)).toEqual({ survivors: 30, money: 4, food: 4 })
  })
})

describe('assertGameDefinition', () => {
  it('接受合法定义', () => {
    expect(() => assertGameDefinition(moonColonyBloodbath)).not.toThrow()
  })

  it('拒绝没有主计数器的定义', () => {
    const broken = {
      ...moonColonyBloodbath,
      counters: moonColonyBloodbath.counters.map((c) => ({ ...c, hero: false })),
    }
    expect(() => assertGameDefinition(broken)).toThrow('主计数器')
  })

  it('拒绝快捷行动引用不存在的计数器', () => {
    const broken = {
      ...moonColonyBloodbath,
      quickActions: [{ id: 'x', label: 'x', delta: { oxygen: 1 } }],
    }
    expect(() => assertGameDefinition(broken)).toThrow('不存在的计数器')
  })

  it('拒绝初始值越界的计数器', () => {
    const broken = {
      ...moonColonyBloodbath,
      counters: moonColonyBloodbath.counters.map((c) =>
        c.id === 'money' ? { ...c, initial: -1 } : c,
      ),
    }
    expect(() => assertGameDefinition(broken)).toThrow('不在范围内')
  })
})
