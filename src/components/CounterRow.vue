<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { CounterDefinition, QuickActionDefinition } from '@/games'

const props = defineProps<{
  definition: CounterDefinition
  value: number
  /** 只读视角不渲染任何加减控件 */
  editable: boolean
  /** 这一栏属于谁。切换查看对象时痕迹必须跟着换人，不能把跳变记成一次书写 */
  owner: string
  /** 只作用于本资源的快捷行动，渲染在这一行的标题行里 */
  actions?: readonly QuickActionDefinition[]
}>()

const emit = defineEmits<{ adjust: [delta: number]; quick: [actionId: string] }>()

const isHero = computed(() => props.definition.hero === true)
const mainStep = computed(() => props.definition.steps[0] ?? 1)
const subSteps = computed(() => props.definition.steps.slice(1))
/** 主按钮在内、大步进在外，拇指从中间向外够 */
const decSteps = computed(() => [...subSteps.value].reverse().concat(mainStep.value))
const incSteps = computed(() => [mainStep.value, ...subSteps.value])
const canDecrease = computed(() => props.value > props.definition.min)
const canIncrease = computed(() => props.value < props.definition.max)
const quickActions = computed(() => props.actions ?? [])

/**
 * 读数降一档的阈值。加减键是定宽的，三位数的 64px 读数会撑破中间那一格，
 * 所以破百之后落到下一档 —— 仍在三档之内，不引入流体字号。
 */
const WIDE_VALUE = 100
const readoutSize = computed(() => (props.value >= WIDE_VALUE ? 'text-num-m' : 'text-num-l'))

/**
 * 每行的身份由这支资源色承担：名称块与两枚主步进键实心同色，快捷行动是同色空心框，
 * 三行之间靠颜色分开。实心＝主要、空心＝次要，资源色＝属于这支资源、石墨＝通用步进。
 * 资源色是预印的底材，读数仍然是石墨那支笔。
 *
 * 色值走 CSS 变量而不是内联 background —— 内联样式优先级最高，
 * 会盖掉 `.tap:disabled` 的灰底，到达上下限的键就不会变灰。
 */
const rowInk = computed(() => ({ '--key-ink': props.definition.color }))

/** 主步进是实心压印键，副步进是空心框；这个材质差对每个资源都一样 */
const isMainKey = (step: number) => step === mainStep.value

/*
 * 签名交互：数字变化时墨迹落定，同时在读数下方留下一道铅笔痕。
 * 痕迹不会自己消失 —— 它留在版面上直到被更新的痕迹挤出，
 * 所以「我刚才点了什么」始终看得见，而不是一闪而过。
 */
const PENCIL_MARKS = 3
const inkKey = ref(0)
const marks = ref<{ id: number; text: string }[]>([])
let markId = 0

watch(
  () => [props.owner, props.value] as const,
  ([owner, next], [previousOwner, previous]) => {
    // 换人：翻到另一栏，旧痕迹留在旧的那一栏里，这次数值跳变不是谁写的
    if (owner !== previousOwner) {
      marks.value = []
      inkKey.value += 1
      return
    }
    const delta = next - previous
    if (delta === 0) return
    inkKey.value += 1
    marks.value = [
      ...marks.value.slice(-(PENCIL_MARKS - 1)),
      { id: ++markId, text: `${delta > 0 ? '+' : '−'}${Math.abs(delta)}` },
    ]
  },
)
</script>

<template>
  <div
    class="hair-b flex flex-col justify-center gap-2 px-3 py-2 last:border-b-0"
    :style="rowInk"
    :data-counter="definition.id"
  >
    <!--
      标题行：资源名是这一行的标题，页边跟着这个数的注解 —— 开局值与最近几道铅笔痕。
      行动键已经搬到读数正下方，标题行右端空了出来，注解放回这里省掉整整一行。
    -->
    <div class="flex items-center gap-2">
      <h3 class="lead bg-[var(--key-ink)] px-2.5 py-0.5 text-paper">
        {{ definition.name }}
      </h3>
      <span v-if="isHero" class="label-cn font-normal text-pencil">排行依据</span>
      <span class="label-cn ml-auto flex items-baseline gap-2 font-normal text-pencil">
        <span>起始 {{ definition.initial }}</span>
        <span
          v-for="mark in marks"
          :key="mark.id"
          class="tabular pencil-in text-pencil-light"
          aria-hidden="true"
        >
          {{ mark.text }}
        </span>
      </span>
    </div>

    <div class="flex items-center gap-2">
      <div v-if="editable" class="flex shrink-0 gap-1.5">
        <button
          v-for="step in decSteps"
          :key="`dec-${step}`"
          type="button"
          class="tap tabular flex items-center justify-center border-2 font-bold"
          :class="
            isMainKey(step)
              ? 'tap-solid h-16 w-16 border-[var(--key-ink)] bg-[var(--key-ink)] text-num-s text-paper max-[380px]:h-14 max-[380px]:w-14'
              : 'h-13 w-13 border-graphite bg-paper text-body text-graphite max-[380px]:h-12 max-[380px]:w-12'
          "
          :disabled="!canDecrease"
          :data-testid="`counter-${definition.id}-dec-${step}`"
          :aria-label="`${definition.name} 减 ${step}`"
          @click="emit('adjust', -step)"
        >
          −{{ step }}
        </button>
      </div>

      <div class="min-w-0 flex-1 text-center">
        <div class="relative">
          <!-- 读数是手写的那支笔：自己那一栏石墨，复写联上是淡一档的碳墨 -->
          <p
            :key="inkKey"
            class="tabular ink-set font-bold"
            :class="[readoutSize, editable ? 'text-graphite' : 'text-carbon-ink']"
            :data-testid="`counter-${definition.id}-value`"
          >
            {{ value }}
          </p>
          <!-- 笔尖划过格底 -->
          <span
            :key="`nib-${inkKey}`"
            class="nib-stroke pointer-events-none absolute inset-x-6 -bottom-0.5 h-[2px] bg-mark opacity-0"
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <div v-if="editable" class="flex shrink-0 gap-1.5">
        <button
          v-for="step in incSteps"
          :key="`inc-${step}`"
          type="button"
          class="tap tabular flex items-center justify-center border-2 font-bold"
          :class="
            isMainKey(step)
              ? 'tap-solid h-16 w-16 border-[var(--key-ink)] bg-[var(--key-ink)] text-num-s text-paper max-[380px]:h-14 max-[380px]:w-14'
              : 'h-13 w-13 border-graphite bg-paper text-body text-graphite max-[380px]:h-12 max-[380px]:w-12'
          "
          :disabled="!canIncrease"
          :data-testid="`counter-${definition.id}-inc-${step}`"
          :aria-label="`${definition.name} 加 ${step}`"
          @click="emit('adjust', step)"
        >
          +{{ step }}
        </button>
      </div>
    </div>

    <!--
      回合行动落在这个数的正下方，和它对齐 —— 它改的就是这个数。
      与两侧的步进键分层：步进是「改一点」，行动是游戏里的一步，
      所以是同色空心框而不是实心键。
    -->
    <div v-if="editable && quickActions.length" class="flex justify-center gap-2">
      <!--
        印章要有足够的面纸可盖：按键撑到一个舒适的宽度再居中，
        上限留着，多个行动并排时各自平分而不是把行挤满。
      -->
      <button
        v-for="action in quickActions"
        :key="action.id"
        type="button"
        class="tap-stamp min-h-12 min-w-0 max-w-64 flex-1 border-2 border-[var(--key-ink)] bg-paper px-6 text-body font-bold text-[var(--key-ink)]"
        :data-testid="`quick-${action.id}`"
        @click="emit('quick', action.id)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>
