<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/utils/room-code'

/**
 * 房间号四格：预印在纸上的四个空格，一格一个字符。
 *
 * 四个格子只管显示，接字的是盖在它们上面的一个透明输入框，整串房间号都在它里面。
 * 不做成「四个输入框、敲一位挪一次焦点」：iOS WebKit（含微信）的键盘手里还握着刚敲的
 * 字母时，挪焦点会让它把字母再交一遍，改焦点框的值又会让它有字不画。单个输入框既不挪
 * 焦点、也不逐键改值，退格与长按粘贴也都是浏览器原生的。
 *
 * 值始终是一段连续的字符串，第 n 格就是第 n 个字符；插入点收在串尾，红框落在下一个待填格。
 */
const model = defineModel<string>({ required: true })

const field = ref<HTMLInputElement | null>(null)
const focused = ref(false)

const chars = computed(() =>
  Array.from({ length: ROOM_CODE_LENGTH }, (_, index) => model.value[index] ?? ''),
)

/** 下一个待填格；填满时停在最后一格 */
const cursor = computed(() => Math.min(model.value.length, ROOM_CODE_LENGTH - 1))

/** 会把插入点挪离串尾的按键：值只在串尾增删，所以一律不放行 */
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'])

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const code = normalizeRoomCode(target.value)
  model.value = code
  // 只在剔掉了非法字符时回写，仅大小写不同不碰输入框；输入法组字中途也不碰，
  // 改值会打断组字，留到 compositionend 再收拾。
  const composing = event instanceof InputEvent && event.isComposing
  if (!composing && target.value.toUpperCase() !== code) target.value = code
}

function onKeydown(event: KeyboardEvent): void {
  if (CARET_KEYS.has(event.key)) event.preventDefault()
}

/** 粘贴整串替换：先剔非法字符再截断，带分隔符或前后缀的邀请文字也能取出房间号 */
function onPaste(event: ClipboardEvent): void {
  event.preventDefault()
  const pasted = normalizeRoomCode(event.clipboardData?.getData('text') ?? '')
  if (!pasted) return
  if (field.value) field.value.value = pasted
  model.value = pasted
}

/** 插入点收在串尾：点哪一格，敲下去的字都接在已填的后面 */
function caretToEnd(): void {
  const end = field.value?.value.length ?? 0
  field.value?.setSelectionRange(end, end)
}

function onFocus(): void {
  focused.value = true
  caretToEnd()
}

onMounted(() => {
  if (field.value) field.value.value = model.value
})

// 外部改值（清空、回填）时把输入框对齐；自己敲出来的值已经一致，不会回写
watch(model, (code) => {
  if (field.value && normalizeRoomCode(field.value.value) !== code) field.value.value = code
})
</script>

<template>
  <div class="relative flex gap-2">
    <div
      v-for="(char, index) in chars"
      :key="index"
      class="tabular flex h-18 min-w-0 flex-1 items-center justify-center border-2 bg-paper text-num-m font-bold text-graphite"
      :class="focused && index === cursor ? 'border-mark' : 'border-graphite'"
      :data-testid="`room-code-box-${index}`"
      aria-hidden="true"
    >
      {{ char }}
    </div>
    <!-- 字号不低于 16px，否则 iOS 聚焦时会放大整页 -->
    <input
      ref="field"
      type="text"
      inputmode="text"
      autocapitalize="characters"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      :maxlength="ROOM_CODE_LENGTH"
      class="absolute inset-0 h-full w-full text-body opacity-0"
      aria-label="房间号，四位字母或数字"
      data-testid="room-code-input"
      @input="onInput"
      @compositionend="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @focus="onFocus"
      @blur="focused = false"
      @click="caretToEnd"
    />
  </div>
</template>
