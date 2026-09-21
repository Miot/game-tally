<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import type { CounterDefinition, QuickActionDefinition } from '@/games'

const props = defineProps<{
  definition: CounterDefinition
  value: number
  /** 只读视角不渲染加减与快捷按钮 */
  editable: boolean
  /** 只作用于本计数器的快捷行动，渲染在标题行右侧 */
  actions?: QuickActionDefinition[]
}>()

const emit = defineEmits<{ adjust: [delta: number]; quick: [actionId: string] }>()

const isHero = computed(() => props.definition.hero === true)
const mainStep = computed(() => props.definition.steps[0] ?? 1)
const subSteps = computed(() => props.definition.steps.slice(1))
const canDecrease = computed(() => props.value > props.definition.min)
const canIncrease = computed(() => props.value < props.definition.max)
const quickActions = computed(() => props.actions ?? [])

/*
 * 数值变化的三重反馈：卡片闪色、读数弹跳、增量气泡浮出。
 * 先清空再在下一帧赋值，连点时动画才会重新播放。
 */
const flashClass = ref('')
const popClass = ref('')
const bubble = ref<{ text: string; up: boolean } | null>(null)

const { start: clearEffects } = useTimeoutFn(
  () => {
    flashClass.value = ''
    popClass.value = ''
    bubble.value = null
  },
  720,
  { immediate: false },
)

watch(
  () => props.value,
  (next, prev) => {
    const delta = next - prev
    if (delta === 0) return
    const up = delta > 0
    flashClass.value = ''
    popClass.value = ''
    bubble.value = null
    requestAnimationFrame(() => {
      flashClass.value = up ? 'flash-gain' : 'flash-alert'
      popClass.value = up ? 'pop-up' : 'pop-down'
      bubble.value = { text: `${up ? '+' : '−'}${Math.abs(delta)}`, up }
      clearEffects()
    })
  },
)
</script>

<template>
  <section class="panel p-4" :class="flashClass" :data-counter="definition.id">
    <header class="flex items-center gap-3">
      <img
        :src="definition.icon"
        :alt="definition.name"
        class="shrink-0 object-contain drop-shadow-sm"
        :class="isHero ? 'h-12 w-12' : 'h-10 w-10'"
        decoding="async"
      />
      <h3 class="font-display text-xs tracking-[0.3em] text-ink-2 uppercase">
        {{ definition.name }}
      </h3>
      <div v-if="editable && quickActions.length" class="ml-auto flex items-center gap-2">
        <button
          v-for="action in quickActions"
          :key="action.id"
          type="button"
          class="tap min-h-10 rounded-full border border-amber-deep/40 bg-amber/10 px-3 font-display text-xs tracking-wider text-amber-deep"
          :data-testid="`quick-${action.id}`"
          @click="emit('quick', action.id)"
        >
          {{ action.label }}
        </button>
      </div>
      <span v-else-if="isHero" class="ml-auto font-display text-[10px] tracking-widest text-ink-3">
        排行依据
      </span>
    </header>

    <div class="relative" :class="isHero ? 'my-3' : 'my-2'">
      <p
        class="readout text-center"
        :class="[isHero ? 'text-7xl' : 'text-5xl', popClass]"
        :style="{ color: definition.color }"
        :data-testid="`counter-${definition.id}-value`"
        :aria-label="`${definition.name} ${value}`"
      >
        {{ value }}
      </p>
      <span
        v-if="bubble"
        class="readout pointer-events-none absolute top-1/2 right-3 -mt-3 font-bold"
        :class="[
          isHero ? 'text-2xl' : 'text-xl',
          bubble.up ? 'text-accent-deep bubble-rise' : 'text-alert bubble-sink',
        ]"
        aria-hidden="true"
      >
        {{ bubble.text }}
      </span>
    </div>

    <div v-if="editable" class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="tap flex items-center justify-center rounded-full border-2 border-alert/60 bg-alert/8 font-display font-bold text-alert"
          :class="isHero ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl'"
          :disabled="!canDecrease"
          :data-testid="`counter-${definition.id}-dec-${mainStep}`"
          :aria-label="`${definition.name} 减 ${mainStep}`"
          @click="emit('adjust', -mainStep)"
        >
          −{{ mainStep }}
        </button>
        <button
          v-for="step in subSteps"
          :key="`dec-${step}`"
          type="button"
          class="tap flex h-11 min-w-14 items-center justify-center rounded-full border border-alert/40 bg-surface px-3 font-display text-sm text-alert"
          :disabled="!canDecrease"
          :data-testid="`counter-${definition.id}-dec-${step}`"
          :aria-label="`${definition.name} 减 ${step}`"
          @click="emit('adjust', -step)"
        >
          −{{ step }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="step in subSteps"
          :key="`inc-${step}`"
          type="button"
          class="tap flex h-11 min-w-14 items-center justify-center rounded-full border border-accent/40 bg-surface px-3 font-display text-sm text-accent-deep"
          :disabled="!canIncrease"
          :data-testid="`counter-${definition.id}-inc-${step}`"
          :aria-label="`${definition.name} 加 ${step}`"
          @click="emit('adjust', step)"
        >
          +{{ step }}
        </button>
        <button
          type="button"
          class="tap flex items-center justify-center rounded-full border-2 border-accent/60 bg-accent/10 font-display font-bold text-accent-deep"
          :class="isHero ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl'"
          :disabled="!canIncrease"
          :data-testid="`counter-${definition.id}-inc-${mainStep}`"
          :aria-label="`${definition.name} 加 ${mainStep}`"
          @click="emit('adjust', mainStep)"
        >
          +{{ mainStep }}
        </button>
      </div>
    </div>
  </section>
</template>
