import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import { initialCounters, type CounterId, type GameDefinition } from '@/games'
import { mergePlayerState, type PlayerState, type SyncMessage } from '@/sync/messages'
import type { ConnectionStatus, RelayInfo, RoomTransport } from '@/sync/transport'

import type { Profile } from './settings'

export interface Presence {
  peerId: string | null
  online: boolean
  lastSeen: number
}

export interface OpenRoomOptions {
  code: string
  game: GameDefinition
  profile: Profile
  transport: RoomTransport
  /** 默认 localStorage；测试注入内存实现以隔离各玩家 */
  storage?: Storage
}

interface RoomCache {
  gameId: string
  players: Record<string, PlayerState>
  savedAt: number
}

interface CounterChange {
  counterId: CounterId
  delta: number
}

interface UndoEntry {
  changes: CounterChange[]
}

/** 连续点击合并为一次广播的延迟 */
export const BROADCAST_DELAY_MS = 120
const UNDO_LIMIT = 50
export const LAST_ROOM_KEY = 'gametally:last-room'

export function roomCacheKey(code: string): string {
  return `gametally:room:${code}`
}

export function roomIdOf(gameId: string, code: string): string {
  return `${gameId}/${code}`
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const useRoomStore = defineStore('room', () => {
  const code = ref<string | null>(null)
  const game = shallowRef<GameDefinition | null>(null)
  const myPlayerId = ref<string | null>(null)
  const players = ref<Record<string, PlayerState>>({})
  const presence = ref<Record<string, Presence>>({})
  const peerCount = ref(0)
  const relays = ref<RelayInfo[]>([])
  /** 当前传输层的连接标识，用于连接诊断 */
  const selfId = ref<string | null>(null)
  const phase = ref<'idle' | 'joining' | 'joined' | 'error'>('idle')
  const viewingPlayerId = ref<string | null>(null)
  const undoStack = ref<UndoEntry[]>([])

  let transport: RoomTransport | null = null
  let storage: Storage | null = null
  let disposers: Array<() => void> = []
  let broadcastTimer: ReturnType<typeof setTimeout> | null = null
  const peerToPlayer = new Map<string, string>()

  const me = computed(() => (myPlayerId.value ? (players.value[myPlayerId.value] ?? null) : null))
  const viewing = computed(() =>
    viewingPlayerId.value ? (players.value[viewingPlayerId.value] ?? null) : null,
  )
  const isViewingSelf = computed(() => viewingPlayerId.value === myPlayerId.value)
  const canUndo = computed(() => undoStack.value.length > 0)

  const status = computed<ConnectionStatus>(() => {
    if (phase.value === 'idle') return 'idle'
    if (phase.value === 'error') return 'error'
    if (peerCount.value > 0 || relays.value.some((relay) => relay.state === 'open')) {
      return 'connected'
    }
    return 'connecting'
  })

  /** 本人排第一，其余按加入顺序（首次出现时间）排列，保证切换条顺序稳定 */
  const orderedPlayers = computed<PlayerState[]>(() => {
    const list = Object.values(players.value)
    const mine = myPlayerId.value
    return list.sort((a, b) => {
      if (a.playerId === mine) return -1
      if (b.playerId === mine) return 1
      return a.name.localeCompare(b.name, 'zh-Hans-CN') || a.playerId.localeCompare(b.playerId)
    })
  })

  const ranking = computed<PlayerState[]>(() => {
    const rule = game.value?.ranking
    if (!rule) return []
    const sign = rule.order === 'desc' ? -1 : 1
    return [...Object.values(players.value)].sort(
      (a, b) =>
        sign * ((a.counters[rule.counterId] ?? 0) - (b.counters[rule.counterId] ?? 0)) ||
        a.name.localeCompare(b.name, 'zh-Hans-CN'),
    )
  })

  function isEliminated(state: PlayerState): boolean {
    const rule = game.value?.elimination
    if (!rule) return false
    return (state.counters[rule.counterId] ?? 0) <= rule.atOrBelow
  }

  function isOnline(playerId: string): boolean {
    if (playerId === myPlayerId.value) return true
    return presence.value[playerId]?.online ?? false
  }

  function createInitialState(profile: Profile, definition: GameDefinition): PlayerState {
    return {
      playerId: profile.playerId,
      name: profile.name,
      avatar: profile.avatar,
      counters: initialCounters(definition),
      version: 1,
      updatedAt: Date.now(),
    }
  }

  function loadCache(roomCode: string, gameId: string): Record<string, PlayerState> {
    if (!storage) return {}
    const raw = storage.getItem(roomCacheKey(roomCode))
    if (!raw) return {}
    try {
      const cache = JSON.parse(raw) as RoomCache
      return cache.gameId === gameId ? cache.players : {}
    } catch {
      return {}
    }
  }

  function persist(): void {
    if (!storage || !code.value || !game.value) return
    const cache: RoomCache = { gameId: game.value.id, players: players.value, savedAt: Date.now() }
    storage.setItem(roomCacheKey(code.value), JSON.stringify(cache))
  }

  function refreshRelays(): void {
    relays.value = transport ? transport.relays() : []
  }

  function refreshPeerCount(): void {
    peerCount.value = transport ? transport.peers().length : 0
  }

  function broadcastNow(): void {
    if (broadcastTimer) {
      clearTimeout(broadcastTimer)
      broadcastTimer = null
    }
    if (!transport || !me.value) return
    transport.send({ type: 'state', state: me.value })
  }

  function scheduleBroadcast(): void {
    if (broadcastTimer) return
    broadcastTimer = setTimeout(() => {
      broadcastTimer = null
      broadcastNow()
    }, BROADCAST_DELAY_MS)
  }

  function markOnline(playerId: string, peerId: string): void {
    peerToPlayer.set(peerId, playerId)
    presence.value[playerId] = { peerId, online: true, lastSeen: Date.now() }
  }

  function applyIncoming(state: PlayerState): void {
    if (state.playerId === myPlayerId.value) return
    const current = players.value[state.playerId]
    const merged = mergePlayerState(current, state)
    if (merged !== current) players.value[state.playerId] = merged
  }

  function handleMessage(message: SyncMessage, fromPeerId: string): void {
    if (message.type === 'state') {
      applyIncoming(message.state)
      markOnline(message.state.playerId, fromPeerId)
    } else {
      message.states.forEach(applyIncoming)
      markOnline(message.from, fromPeerId)
    }
    persist()
  }

  function handlePeerJoin(peerId: string): void {
    refreshPeerCount()
    if (!transport || !myPlayerId.value) return
    transport.send(
      { type: 'snapshot', from: myPlayerId.value, states: Object.values(players.value) },
      peerId,
    )
  }

  function handlePeerLeave(peerId: string): void {
    refreshPeerCount()
    const playerId = peerToPlayer.get(peerId)
    peerToPlayer.delete(peerId)
    if (!playerId) return
    const current = presence.value[playerId]
    if (current?.peerId === peerId) {
      presence.value[playerId] = { peerId: null, online: false, lastSeen: Date.now() }
    }
  }

  async function open(options: OpenRoomOptions): Promise<void> {
    await close()
    storage = options.storage ?? globalThis.localStorage
    code.value = options.code
    game.value = options.game
    myPlayerId.value = options.profile.playerId

    const cached = loadCache(options.code, options.game.id)
    const mine = cached[options.profile.playerId]
    cached[options.profile.playerId] = mine
      ? {
          ...mine,
          name: options.profile.name,
          avatar: options.profile.avatar,
          version: mine.version + 1,
          updatedAt: Date.now(),
        }
      : createInitialState(options.profile, options.game)
    players.value = cached
    presence.value = {}
    viewingPlayerId.value = options.profile.playerId
    undoStack.value = []
    storage.setItem(LAST_ROOM_KEY, options.code)

    transport = options.transport
    selfId.value = options.transport.selfId
    disposers = [
      transport.onMessage(handleMessage),
      transport.onPeerJoin(handlePeerJoin),
      transport.onPeerLeave(handlePeerLeave),
    ]
    phase.value = 'joining'
    try {
      await transport.join(roomIdOf(options.game.id, options.code))
      phase.value = 'joined'
    } catch (error) {
      phase.value = 'error'
      throw error
    }
    refreshRelays()
    refreshPeerCount()
    broadcastNow()
    persist()
  }

  /** 关闭连接但保留本地缓存；forget 为 true 时同时忘记「上次房间」 */
  async function close(options: { forget?: boolean } = {}): Promise<void> {
    if (broadcastTimer) {
      clearTimeout(broadcastTimer)
      broadcastTimer = null
    }
    disposers.forEach((dispose) => dispose())
    disposers = []
    if (transport) {
      await transport.leave()
      transport = null
    }
    selfId.value = null
    if (options.forget && storage) storage.removeItem(LAST_ROOM_KEY)
    peerToPlayer.clear()
    phase.value = 'idle'
    peerCount.value = 0
    relays.value = []
  }

  function commitChanges(changes: CounterChange[], recordUndo: boolean): void {
    const current = me.value
    if (!current || changes.length === 0) return
    const counters = { ...current.counters }
    for (const change of changes) counters[change.counterId] += change.delta
    const last = changes[changes.length - 1]!
    players.value[current.playerId] = {
      ...current,
      counters,
      version: current.version + 1,
      updatedAt: Date.now(),
      lastChange: { counterId: last.counterId, delta: last.delta, at: Date.now() },
    }
    if (recordUndo) {
      undoStack.value.push({ changes })
      if (undoStack.value.length > UNDO_LIMIT) undoStack.value.shift()
    }
    scheduleBroadcast()
    persist()
  }

  /** 计算受范围约束后实际生效的增减量，0 表示没有变化 */
  function effectiveDelta(counterId: CounterId, delta: number): number {
    const definition = game.value?.counters.find((counter) => counter.id === counterId)
    const current = me.value
    if (!definition || !current) return 0
    const value = current.counters[counterId] ?? definition.initial
    return clamp(value + delta, definition.min, definition.max) - value
  }

  function adjust(counterId: CounterId, delta: number): void {
    const applied = effectiveDelta(counterId, delta)
    if (applied === 0) return
    commitChanges([{ counterId, delta: applied }], true)
  }

  function applyQuickAction(actionId: string): void {
    const action = game.value?.quickActions.find((item) => item.id === actionId)
    if (!action) return
    const changes: CounterChange[] = []
    for (const [counterId, delta] of Object.entries(action.delta)) {
      const applied = effectiveDelta(counterId, delta ?? 0)
      if (applied !== 0) changes.push({ counterId, delta: applied })
    }
    commitChanges(changes, true)
  }

  function undo(): void {
    const entry = undoStack.value.pop()
    if (!entry) return
    commitChanges(
      entry.changes.map((change) => ({ counterId: change.counterId, delta: -change.delta })),
      false,
    )
  }

  function resetMine(): void {
    const current = me.value
    if (!current || !game.value) return
    players.value[current.playerId] = {
      ...current,
      counters: initialCounters(game.value),
      version: current.version + 1,
      updatedAt: Date.now(),
      lastChange: undefined,
    }
    undoStack.value = []
    scheduleBroadcast()
    persist()
  }

  function updateProfile(profile: Profile): void {
    const current = me.value
    if (!current) return
    players.value[current.playerId] = {
      ...current,
      name: profile.name,
      avatar: profile.avatar,
      version: current.version + 1,
      updatedAt: Date.now(),
    }
    scheduleBroadcast()
    persist()
  }

  function view(playerId: string): void {
    if (players.value[playerId]) viewingPlayerId.value = playerId
  }

  /** 回到前台或网络恢复时调用：刷新连接信息并把自己的状态再发一遍 */
  function rebroadcast(): void {
    refreshRelays()
    refreshPeerCount()
    broadcastNow()
  }

  return {
    code,
    game,
    myPlayerId,
    players,
    presence,
    peerCount,
    relays,
    selfId,
    phase,
    status,
    viewingPlayerId,
    me,
    viewing,
    isViewingSelf,
    canUndo,
    orderedPlayers,
    ranking,
    isEliminated,
    isOnline,
    open,
    close,
    adjust,
    applyQuickAction,
    undo,
    resetMine,
    updateProfile,
    view,
    rebroadcast,
    refreshRelays,
  }
})
