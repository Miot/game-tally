<script setup lang="ts">
import { computed } from 'vue'

import type { CounterId, GameDefinition } from '@/games'
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

const subtitle = computed(() => {
  if (props.editable) return '我的殖民地'
  return props.online ? '在线 · 只读' : '离线 · 只读，显示最后同步的数据'
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
  return `最近 ${counterName(change.counterId)} ${sign}${change.delta} · ${time}`
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <header class="panel flex items-center gap-3 p-3">
      <div class="h-12 w-12 shrink-0">
        <RobotAvatar :index="state.avatar" :offline="!online" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h2 class="truncate text-lg font-semibold">{{ state.name }}</h2>
          <span
            v-if="eliminated"
            class="shrink-0 rounded-full border border-alert bg-alert/15 px-2 py-0.5 font-display text-[10px] tracking-widest text-alert"
          >
            {{ game.elimination.label }}
          </span>
        </div>
        <p class="truncate text-xs text-ink-2">{{ subtitle }}</p>
      </div>
      <p v-if="lastChangeText" class="max-w-28 text-right text-[11px] leading-tight text-ink-2">
        {{ lastChangeText }}
      </p>
    </header>

    <TokenCounter
      v-for="counter in game.counters"
      :key="counter.id"
      :definition="counter"
      :value="state.counters[counter.id] ?? counter.initial"
      :editable="editable"
      @adjust="(delta) => emit('adjust', counter.id, delta)"
    />

    <div v-if="editable" class="flex flex-wrap items-center gap-2">
      <button
        v-for="action in game.quickActions"
        :key="action.id"
        type="button"
        class="tap min-h-11 flex-1 rounded-full border border-amber/50 bg-surface px-4 font-display text-xs tracking-wider text-amber-deep"
        :data-testid="`quick-${action.id}`"
        @click="emit('quick', action.id)"
      >
        {{ action.label }}
      </button>
      <button
        type="button"
        class="tap min-h-11 rounded-full border border-line bg-surface px-4 text-sm text-ink-2"
        :disabled="!canUndo"
        @click="emit('undo')"
      >
        撤销
      </button>
    </div>
  </div>
</template>
