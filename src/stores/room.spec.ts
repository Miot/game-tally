import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { moonColonyBloodbath } from '@/games/moon-colony-bloodbath'
import { MemoryHub } from '@/sync/memory-transport'
import { MemoryStorage } from '@/test-utils/memory-storage'

import { BROADCAST_DELAY_MS, LAST_ROOM_KEY, roomCacheKey, useRoomStore } from './room'
import type { Profile } from './settings'

const CODE = 'K7PQ'

function createPlayer(hub: MemoryHub, id: string, storage = new MemoryStorage()) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useRoomStore(pinia)
  const profile: Profile = { playerId: `player-${id}`, name: id, avatar: 0 }
  const transport = hub.createTransport(`peer-${id}`)
  const open = () =>
    store.open({ code: CODE, game: moonColonyBloodbath, profile, transport, storage })
  return { store, profile, transport, storage, open }
}

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

  it('入房后创建自己的初始状态并记录上次房间', async () => {
    const a = createPlayer(hub, 'A')
    await a.open()
    expect(a.store.me?.counters).toEqual({ survivors: 30, money: 4, food: 4 })
    expect(a.store.viewingPlayerId).toBe('player-A')
    expect(a.store.isViewingSelf).toBe(true)
    expect(a.storage.getItem(LAST_ROOM_KEY)).toBe(CODE)
    expect(a.store.status).toBe('connected')
  })

  it('两位玩家互相看到对方，修改后经广播同步', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    expect(Object.keys(a.store.players).sort()).toEqual(['player-A', 'player-B'])
    expect(Object.keys(b.store.players).sort()).toEqual(['player-A', 'player-B'])
    expect(a.store.isOnline('player-B')).toBe(true)

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
    expect(c.store.isOnline('player-B')).toBe(true)
  })

  it('计数不会越过定义的上下限', async () => {
    const a = createPlayer(hub, 'A')
    await a.open()
    a.store.adjust('money', -10)
    expect(a.store.me?.counters.money).toBe(0)
    a.store.adjust('food', 5000)
    expect(a.store.me?.counters.food).toBe(999)
    const version = a.store.me!.version
    a.store.adjust('money', -1)
    expect(a.store.me?.version).toBe(version)
  })

  it('撤销按操作逆序恢复，快捷行动作为一组撤销', async () => {
    const a = createPlayer(hub, 'A')
    await a.open()
    a.store.adjust('survivors', -5)
    a.store.applyQuickAction('mine')
    expect(a.store.me?.counters).toMatchObject({ survivors: 25, money: 8 })
    expect(a.store.canUndo).toBe(true)

    a.store.undo()
    expect(a.store.me?.counters).toMatchObject({ survivors: 25, money: 4 })
    a.store.undo()
    expect(a.store.me?.counters).toMatchObject({ survivors: 30, money: 4 })
    expect(a.store.canUndo).toBe(false)
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

  it('忽略冒充本人的状态消息', async () => {
    const a = createPlayer(hub, 'A')
    await a.open()
    const intruder = hub.createTransport('peer-X')
    await intruder.join('moon-colony-bloodbath/K7PQ')
    intruder.send({
      type: 'state',
      state: { ...a.store.me!, counters: { survivors: 0, money: 0, food: 0 }, version: 999 },
    })
    expect(a.store.me?.counters.survivors).toBe(30)
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
    expect(storage.getItem(roomCacheKey(CODE))).not.toBeNull()

    const again = createPlayer(hub, 'A', storage)
    await again.open()
    expect(again.store.me?.counters.survivors).toBe(26)
    expect(again.store.me?.version).toBe(versionBefore + 1)
    expect(again.store.players['player-B']?.counters.food).toBe(6)
  })

  it('排行按幸存者降序，幸存者归零视为出局', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    a.store.adjust('survivors', -30)
    await flush()
    expect(b.store.ranking.map((p) => p.playerId)).toEqual(['player-B', 'player-A'])
    expect(b.store.isEliminated(b.store.players['player-A']!)).toBe(true)
    expect(b.store.isEliminated(b.store.players['player-B']!)).toBe(false)
    expect(a.store.orderedPlayers[0]?.playerId).toBe('player-A')
  })

  it('切换查看其他玩家时为只读视角', async () => {
    const a = createPlayer(hub, 'A')
    const b = createPlayer(hub, 'B')
    await a.open()
    await b.open()
    a.store.view('player-B')
    expect(a.store.viewing?.playerId).toBe('player-B')
    expect(a.store.isViewingSelf).toBe(false)
    a.store.view('player-nobody')
    expect(a.store.viewingPlayerId).toBe('player-B')
  })
})
