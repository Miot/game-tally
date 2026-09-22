<script setup lang="ts">
import { computed } from 'vue'

/**
 * 表格里的填空位：底下一条线，字写在线上。
 * 聚焦时发丝线加粗为石墨规则线，是唯一的状态变化。
 */
const props = withDefaults(
  defineProps<{
    label: string
    placeholder?: string
    /** textarea 行数，给出即渲染多行 */
    rows?: number
    maxlength?: number
    autocomplete?: string
    enterkeyhint?: 'done' | 'go' | 'send' | 'search' | 'next'
    /** 标签是否只对读屏软件可见 */
    hideLabel?: boolean
  }>(),
  { hideLabel: false },
)

const model = defineModel<string>({ required: true })

const multiline = computed(() => typeof props.rows === 'number')
</script>

<template>
  <label class="block">
    <span :class="hideLabel ? 'sr-only' : 'label-cn mb-1.5 block text-pencil'">{{ label }}</span>
    <textarea
      v-if="multiline"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      class="block w-full resize-y border-0 border-b border-rule bg-transparent px-0 py-2 text-body text-graphite placeholder:text-pencil focus:border-b-2 focus:border-graphite focus:outline-none"
    ></textarea>
    <input
      v-else
      v-model="model"
      type="text"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :enterkeyhint="enterkeyhint"
      class="block min-h-11 w-full border-0 border-b border-rule bg-transparent px-0 py-2 text-body text-graphite placeholder:text-pencil focus:border-b-2 focus:border-graphite focus:outline-none"
    />
  </label>
</template>
