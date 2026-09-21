import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { moonColonyBloodbath } from '@/games/moon-colony-bloodbath'
import { MemoryHub } from '@/sync/memory-transport'
import { MemoryStorage } from '@/test-utils/memory-storage'

import { BROADCAST_DELAY_MS, useRoomStore } from './room'
import type { Profile } from './settings'

/*
 * 只覆盖端到端测不到的一维：多个玩家之间的状态同步。
 * 单设备上的计数边界、撤销、排行由 tests/e2e/room.spec.ts 在真实页面上验证。
 */

const CODE = 'K7PQ'

function createPlayer(hub: MemoryHub, id: string, storage = new MemoryStorage()) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useRoomStore(pinia)
  const profile: Profile = { playerId: `player-${id}`, name: id, avatar: 0 }
  const transport = hub.createTransport(`peer-${id}`)
  const open = () =>
    store.open({ code: CODE, game: moonColonyBloodbath, profile, transport, storage })
  return { store, storage, open }
}

/** 推进到节流窗口之后，让合并后的状态真正发出 */
const flush = () => vi.advanceTimersByTimeAsync(BROADCAST_DELAY_MS + 10)

describe('useRoomStore', () => {
  let hub: MemoryHub

  beforeEach(() => {
    vi.useFakeTimers()
    hub = new MemoryHub()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('两位玩家互相看到对方，连续修改合并为一次广播', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()

    expect(a.store.me?.counters).toEqual({ survivors: 30, money: 4, food: 4 })
    expect(Object.keys(b.store.players).sort()).toEqual(['player-A', 'player-B'])

    a.store.adjust('survivors', -3)
    a.store.adjust('survivors', -1)
    expect(b.store.players['player-A']?.counters.survivors).toBe(30)

    await flush()
    expect(b.store.players['player-A']?.counters.survivors).toBe(26)
    expect(b.store.players['player-A']?.lastChange).toMatchObject({
      counterId: 'survivors',
      delta: -1,
    })
  })

  it('迟到的玩家通过快照拿到全员状态', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    b.store.adjust('money', 5)
    await flush()

    const c = createPlayer(hub, 'C')
    await c.open()
    expect(c.store.players['player-A']?.counters.survivors).toBe(30)
    expect(c.store.players['player-B']?.counters.money).toBe(9)
    expect(c.store.isOnline('player-A')).toBe(true)
  })

  it('玩家离开后标记离线但保留其分数', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    b.store.adjust('survivors', -2)
    await flush()

    await b.store.close()
    expect(a.store.isOnline('player-B')).toBe(false)
    expect(a.store.players['player-B']?.counters.survivors).toBe(28)
    expect(a.store.peerCount).toBe(0)
  })

  it('刷新后从本地缓存恢复自己与他人的分数并延续版本号', async () => {
    const storage = new MemoryStorage()
    const a = createPlayer(hub, 'A', storage)
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    a.store.adjust('survivors', -4)
    b.store.adjust('food', 2)
    await flush()
    const versionBefore = a.store.me!.version
    await a.store.close()

    const again = createPlayer(hub, 'A', storage)
    await again.open()
    expect(again.store.me?.counters.survivors).toBe(26)
    expect(again.store.me?.version).toBe(versionBefore + 1)
    expect(again.store.players['player-B']?.counters.food).toBe(6)
  })

  it('他人只能查看不能修改：冒充本人的消息被忽略', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()

    a.store.view('player-B')
    expect(a.store.isViewingSelf).toBe(false)

    const intruder = hub.createTransport('peer-X')
    await intruder.join(`${moonColonyBloodbath.id}/${CODE}`)
    intruder.send({
      type: 'state',
      state: { ...a.store.me!, counters: { survivors: 0, money: 0, food: 0 }, version: 999 },
    })
    expect(a.store.me?.counters.survivors).toBe(30)
  })
})
