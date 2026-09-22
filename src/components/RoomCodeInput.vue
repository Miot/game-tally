<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '@/utils/room-code'

/**
 * 房间号四格：预印在纸上的四个空格，一格一个字符。
 *
 * 值始终是一段连续的字符串，第 n 格就是第 n 个字符，光标永远落在下一个待填格 ——
 * 不允许出现「第一格空着第三格有字」这种中间空缺，四位码太短，不值得为改中间一位
 * 引入一套选区逻辑。点任意一格都会把光标收回待填格，所以敲下去的字一定落在该落的地方。
 */
const model = defineModel<string>({ required: true })

const boxes = ref<HTMLInputElement[]>([])

const chars = computed(() =>
  Array.from({ length: ROOM_CODE_LENGTH }, (_, index) => model.value[index] ?? ''),
)

/** 下一个待填格；填满时停在最后一格 */
const cursor = computed(() => Math.min(model.value.length, ROOM_CODE_LENGTH - 1))

function sanitize(raw: string): string {
  return raw
    .toUpperCase()
    .split('')
    .filter((char) => ROOM_CODE_ALPHABET.includes(char))
    .join('')
}

function focusAt(index: number): void {
  boxes.value[Math.max(0, Math.min(index, ROOM_CODE_LENGTH - 1))]?.focus()
}

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  // 受控渲染：这一格的字符由 model 决定，输入只用来取新按下的字符
  const typed = sanitize(target.value)
  target.value = ''
  if (!typed) return
  model.value = (model.value + typed).slice(0, ROOM_CODE_LENGTH)
}

function onKeydown(event: KeyboardEvent, index: number): void {
  if (event.key === 'Backspace') {
    event.preventDefault()
    model.value = model.value.slice(0, -1)
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusAt(index - 1)
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusAt(index + 1)
  }
}

function onPaste(event: ClipboardEvent): void {
  event.preventDefault()
  const pasted = sanitize(event.clipboardData?.getData('text') ?? '')
  if (pasted) model.value = pasted.slice(0, ROOM_CODE_LENGTH)
}

/** 点哪一格都把光标收回待填格，敲下去的字才会落在该落的地方 */
function onFocus(index: number): void {
  if (index !== cursor.value) focusAt(cursor.value)
}

watch(
  () => model.value.length,
  async () => {
    await nextTick()
    // 只在这组格子已经有焦点时跟着走，避免抢走页面上其他元素的焦点
    if (boxes.value.some((box) => box === document.activeElement)) focusAt(cursor.value)
  },
)
</script>

<template>
  <div class="flex gap-2" role="group" aria-label="房间号，四位字母或数字" @paste="onPaste">
    <input
      v-for="(char, index) in chars"
      :key="index"
      ref="boxes"
      :value="char"
      type="text"
      inputmode="text"
      autocapitalize="characters"
      autocomplete="off"
      spellcheck="false"
      maxlength="1"
      class="code-box tabular h-18 min-w-0 flex-1 border-2 border-graphite bg-paper text-center text-num-m font-bold text-graphite caret-transparent focus:border-mark"
      :aria-label="`房间号第 ${index + 1} 位`"
      :data-testid="`room-code-box-${index}`"
      @input="onInput"
      @keydown="onKeydown($event, index)"
      @focus="onFocus(index)"
    />
  </div>
</template>
