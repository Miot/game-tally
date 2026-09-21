<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import type { CounterDefinition } from '@/games'

import TokenIcon from './TokenIcon.vue'

const props = defineProps<{
  definition: CounterDefinition
  value: number
  /** 只读视角不渲染加减按钮 */
  editable: boolean
}>()

const emit = defineEmits<{ adjust: [delta: number] }>()

const COLOR_CLASS: Record<CounterDefinition['token'], string> = {
  person: 'text-token-person',
  coin: 'text-token-coin',
  food: 'text-token-food',
}

const colorClass = computed(() => COLOR_CLASS[props.definition.token])
const isHero = computed(() => props.definition.hero === true)
const mainStep = computed(() => props.definition.steps[0] ?? 1)
const subSteps = computed(() => props.definition.steps.slice(1))
const canDecrease = computed(() => props.value > props.definition.min)
const canIncrease = computed(() => props.value < props.definition.max)

/* 数值变化时闪烁：减少为红色警报，增加为青色 */
const flashClass = ref('')
const { start: clearFlashLater } = useTimeoutFn(
  () => {
    flashClass.value = ''
  },
  600,
  { immediate: false },
)
watch(
  () => props.value,
  (next, prev) => {
    flashClass.value = ''
    requestAnimationFrame(() => {
      flashClass.value = next < prev ? 'flash-alert' : 'flash-gain'
      clearFlashLater()
    })
  },
)
</script>

<template>
  <section class="panel p-4" :class="flashClass" :data-counter="definition.id">
    <header class="flex items-center gap-3">
      <div class="shrink-0" :class="[colorClass, isHero ? 'h-12 w-12' : 'h-9 w-9']">
        <TokenIcon :kind="definition.token" />
      </div>
      <h3 class="font-display text-xs tracking-[0.3em] text-ink-2 uppercase">
        {{ definition.name }}
      </h3>
      <span v-if="isHero" class="ml-auto font-display text-[10px] tracking-widest text-ink-3">
        排行依据
      </span>
    </header>

    <p
      class="readout text-center"
      :class="[colorClass, isHero ? 'my-3 text-7xl' : 'my-2 text-5xl']"
      :data-testid="`counter-${definition.id}-value`"
      :aria-label="`${definition.name} ${value}`"
    >
      {{ value }}
    </p>

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
