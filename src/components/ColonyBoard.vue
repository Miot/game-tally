<script setup lang="ts">
import { computed } from 'vue'

import type { CounterId, GameDefinition, QuickActionDefinition } from '@/games'
import type { PlayerState } from '@/sync/messages'

import RobotAvatar from './RobotAvatar.vue'
import TokenCounter from './TokenCounter.vue'

const props = defineProps<{
  game: GameDefinition
  state: PlayerState
  editable: boolean
  online: boolean
  eliminated: boolean
  canUndo: boolean
}>()

const emit = defineEmits<{
  adjust: [counterId: CounterId, delta: number]
  quick: [actionId: string]
  undo: []
}>()

const statusText = computed(() => {
  if (props.editable) return '我'
  return props.online ? '在线 · 只读' : '离线 · 只读'
})

const counterName = (id: CounterId) => props.game.counters.find((c) => c.id === id)?.name ?? id

const lastChangeText = computed(() => {
  const change = props.state.lastChange
  if (!change) return ''
  const sign = change.delta > 0 ? '+' : ''
  const time = new Date(change.at).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${counterName(change.counterId)} ${sign}${change.delta} · ${time}`
})

const touchedCounters = (action: QuickActionDefinition) => Object.keys(action.delta)

/** 只影响单个计数器的快捷行动放进该计数器；影响多个的放在顶部一行 */
const actionsFor = (counterId: CounterId) =>
  props.game.quickActions.filter((action) => {
    const ids = touchedCounters(action)
    return ids.length === 1 && ids[0] === counterId
  })
const sharedActions = computed(() =>
  props.game.quickActions.filter((action) => touchedCounters(action).length > 1),
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2 px-1 text-xs text-ink-2">
      <span class="h-6 w-6 shrink-0">
        <RobotAvatar :index="state.avatar" :offline="!online" />
      </span>
      <span class="truncate font-medium text-ink">{{ state.name }}</span>
      <span class="shrink-0">· {{ statusText }}</span>
      <span
        v-if="eliminated"
        class="shrink-0 rounded-full border border-alert bg-alert/10 px-2 py-0.5 font-display text-[10px] tracking-widest text-alert"
      >
        {{ game.elimination.label }}
      </span>
      <span v-if="lastChangeText" class="ml-auto truncate text-ink-3">{{ lastChangeText }}</span>
      <button
        v-if="editable"
        type="button"
        class="tap ml-auto shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2 shadow-sm"
        :class="lastChangeText ? 'ml-2' : ''"
        :disabled="!canUndo"
        @click="emit('undo')"
      >
        撤销
      </button>
    </div>

    <div v-if="editable && sharedActions.length" class="flex flex-wrap gap-2">
      <button
        v-for="action in sharedActions"
        :key="action.id"
        type="button"
        class="tap min-h-11 flex-1 rounded-full border border-amber-deep/40 bg-amber/10 px-4 font-display text-xs tracking-wider text-amber-deep"
        :data-testid="`quick-${action.id}`"
        @click="emit('quick', action.id)"
      >
        {{ action.label }}
      </button>
    </div>

    <TokenCounter
      v-for="counter in game.counters"
      :key="counter.id"
      :definition="counter"
      :value="state.counters[counter.id] ?? counter.initial"
      :editable="editable"
      :actions="actionsFor(counter.id)"
      @adjust="(delta) => emit('adjust', counter.id, delta)"
      @quick="(actionId) => emit('quick', actionId)"
    />
  </div>
</template>
