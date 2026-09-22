<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'

import type { CounterId, GameDefinition } from '@/games'
import type { PlayerState } from '@/sync/messages'

import CounterRow from './CounterRow.vue'
import PadButton from './PadButton.vue'
import PadIcon from './PadIcon.vue'

/**
 * 写字板：这一页的主体，笔落在这里。
 *
 * 记分是这个应用的任务，所以它占掉屏幕的大头，三个资源等分剩余高度；
 * 全桌只是抬头一瞥的参照，折在上面一行里。
 * 看自己时是白联，可写；看别人时整块换成 NCR 复写黄联并盖上「副本」，
 * 不渲染任何控件 —— 只读不是被禁用的按钮，而是另一张纸。
 */
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
  backToMine: []
}>()

/*
 * 写字板把自己的高度写成一个全局变量，便条据此停在它上沿之外。
 * 否则提示会盖住刚刚点过的那一排行动格。
 */
const root = ref<HTMLElement | null>(null)
const { height } = useElementSize(root)
watchEffect(() => {
  document.documentElement.style.setProperty('--pad-board-h', `${Math.round(height.value)}px`)
})
onBeforeUnmount(() => document.documentElement.style.removeProperty('--pad-board-h'))

const touched = (action: { delta: Readonly<Partial<Record<CounterId, number>>> }) =>
  Object.keys(action.delta)

/**
 * 只作用于一个资源的快捷行动，放进那个资源自己的卡片里 —— 它记的是同一个数，
 * 就该和那个数在一起。影响多个资源的留在底部单独一排。
 */
function actionsFor(counterId: CounterId) {
  return props.game.quickActions.filter((action) => {
    const ids = touched(action)
    return ids.length === 1 && ids[0] === counterId
  })
}

const sharedActions = computed(() =>
  props.game.quickActions.filter((action) => touched(action).length > 1),
)

/** 跨资源的行动要说明它动了哪几项，资源名用各自的那支色 */
function quickTargets(
  delta: Readonly<Partial<Record<CounterId, number>>>,
): { id: CounterId; name: string; color: string }[] {
  return Object.keys(delta).flatMap((id) => {
    const counter = props.game.counters.find((item) => item.id === id)
    return counter ? [{ id: counter.id, name: counter.name, color: counter.color }] : []
  })
}

const lastChangeText = computed(() => {
  const change = props.state.lastChange
  if (!change) return ''
  const counter = props.game.counters.find((item) => item.id === change.counterId)
  const time = new Date(change.at).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${counter?.name ?? change.counterId} ${change.delta > 0 ? '+' : '−'}${Math.abs(change.delta)} · ${time}`
})
</script>

<template>
  <section
    ref="root"
    class="flex flex-col border-t-2 border-graphite shadow-board"
    :class="editable ? 'bg-paper' : 'bg-carbon'"
    :style="editable ? undefined : { '--color-rule': 'var(--color-carbon-line)' }"
    :aria-label="editable ? '我的一栏' : `${state.name} 的副本`"
  >
    <!-- 表头：谁的一栏，以及这一栏能不能写 -->
    <header
      class="flex shrink-0 items-center gap-2 px-3 py-1"
      :class="editable ? 'hair-b' : 'border-b border-carbon-line'"
    >
      <template v-if="editable">
        <h2 class="label-cn text-graphite">我的一栏</h2>
        <p v-if="lastChangeText" class="label-cn truncate font-normal text-pencil">
          {{ lastChangeText }}
        </p>
        <button
          type="button"
          class="tap ml-auto flex h-11 w-11 shrink-0 items-center justify-center border-2 border-graphite bg-paper text-graphite"
          :disabled="!canUndo"
          aria-label="撤销"
          @click="emit('undo')"
        >
          <span class="h-5 w-5"><PadIcon name="undo" /></span>
        </button>
      </template>

      <template v-else>
        <div class="flex min-w-0 flex-1 items-center gap-2" data-testid="readonly-banner">
          <span
            class="label-cn -rotate-3 border-2 border-mark px-1.5 py-0.5 text-mark"
            aria-hidden="true"
          >
            副本
          </span>
          <h2 class="label-cn truncate text-graphite">
            {{ state.name }} 的一栏 · 只读{{ online ? '' : ' · 已离线' }}
          </h2>
        </div>
        <PadButton class="shrink-0" variant="outline" @click="emit('backToMine')">
          回到我的
        </PadButton>
      </template>
    </header>

    <p
      v-if="eliminated"
      class="flex shrink-0 items-center gap-2 border-b border-rule bg-mark-soft px-3 py-2 text-body text-mark"
    >
      <span class="h-4 w-4 shrink-0"><PadIcon name="warning" /></span>
      {{ editable ? '你的' : '' }}{{ game.elimination.label }}，按规则本局在此结束。
    </p>

    <!-- 三个资源等分剩余高度：这局里它们都被频繁增减，没有哪个该被缩小 -->
    <CounterRow
      v-for="counter in game.counters"
      :key="counter.id"
      class="min-h-0 flex-1"
      :definition="counter"
      :value="state.counters[counter.id] ?? counter.initial"
      :editable="editable"
      :owner="state.playerId"
      :actions="actionsFor(counter.id)"
      @adjust="(delta) => emit('adjust', counter.id, delta)"
      @quick="(actionId) => emit('quick', actionId)"
    />

    <!-- 只剩跨资源的行动需要单独一排；本局的两个行动都已各归其位 -->
    <div
      v-if="editable && sharedActions.length"
      class="rule-t flex shrink-0 gap-2 px-3 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]"
    >
      <button
        v-for="action in sharedActions"
        :key="action.id"
        type="button"
        class="tap label-cn flex min-h-12 flex-1 items-center justify-center gap-1.5 border-2 border-graphite bg-paper px-2 text-graphite"
        :data-testid="`quick-${action.id}`"
        @click="emit('quick', action.id)"
      >
        {{ action.label }}
        <span
          v-for="target in quickTargets(action.delta)"
          :key="target.id"
          class="font-bold"
          :style="{ color: target.color }"
        >
          {{ target.name }}
        </span>
      </button>
    </div>
    <div v-else class="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"></div>
  </section>
</template>
