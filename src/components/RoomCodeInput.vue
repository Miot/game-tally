<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/utils/room-code'

/**
 * 房间号四格：预印在纸上的四个空格，一格一个字符。
 *
 * 四个格子只管显示，接字的是盖在它们上面的一个透明输入框。输入框里是键盘交来的原样
 * 文字，格子里显示的是它过滤后的房间号。
 *
 * 唯一的硬约束：输入法组字期间（中文拼音键盘敲字母时，字母就是组字中的文字）不碰输入框
 * —— 不改值、不挪焦点、不动选区。iOS WebKit（含微信）在组字中途被改值后，键盘仍握着
 * 旧的拼音串，会把它再插一遍，表现为一键落两格、凭空多出一位、有字不画。因此：
 * - 不做成四个输入框逐格挪焦点；
 * - 不设 maxlength：组字落定时浏览器会按它截断带空格的拼音串，吃掉后面的字母，
 *   长度改由过滤函数保证；
 * - 非法字符与超长部分只在没有组字时才从输入框里清掉。
 *
 * 值始终是一段连续的字符串，第 n 格就是第 n 个字符；插入点收在串尾，红框落在下一个待填格。
 */
const model = defineModel<string>({ required: true })

const field = ref<HTMLInputElement | null>(null)
const focused = ref(false)
/** 输入法是否正在组字；自己记，不依赖 InputEvent.isComposing 在各家 WebView 里是否可靠 */
let composing = false

const chars = computed(() =>
  Array.from({ length: ROOM_CODE_LENGTH }, (_, index) => model.value[index] ?? ''),
)

/** 下一个待填格；填满时停在最后一格 */
const cursor = computed(() => Math.min(model.value.length, ROOM_CODE_LENGTH - 1))

/** 会把插入点挪离串尾的按键：值只在串尾增删，所以一律不放行 */
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'])

/** 把输入框里的原样文字过滤成房间号；没有组字时顺手把输入框里多余的字符清掉 */
function sync(): void {
  const el = field.value
  if (!el) return
  const code = normalizeRoomCode(el.value)
  model.value = code
  // 仅大小写不同不回写，少碰一次输入框
  if (!composing && el.value.toUpperCase() !== code) el.value = code
}

function onCompositionStart(): void {
  composing = true
}

function onCompositionEnd(): void {
  composing = false
  // 等输入法把这一轮收完再清理，不在它的回调里改值
  setTimeout(sync)
}

function onKeydown(event: KeyboardEvent): void {
  // 组字时方向键归输入法选词用
  if (composing || event.isComposing) return
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
  if (composing) return
  const end = field.value?.value.length ?? 0
  field.value?.setSelectionRange(end, end)
}

function onFocus(): void {
  focused.value = true
  caretToEnd()
}

function onBlur(): void {
  focused.value = false
  // WebKit 在失焦打断组字时不发 compositionend，这里自己收尾
  composing = false
  sync()
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
    <!--
      inputmode="email" 是向系统要一块纯英文键盘：房间号只有字母数字，中文键盘的候选栏
      只会添乱。type 仍是 text，autocapitalize 才生效。
      字号不低于 16px，否则 iOS 聚焦时会放大整页。
    -->
    <input
      ref="field"
      type="text"
      inputmode="email"
      autocapitalize="characters"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      class="absolute inset-0 h-full w-full text-body opacity-0"
      aria-label="房间号，四位字母或数字"
      data-testid="room-code-input"
      @input="sync"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @keydown="onKeydown"
      @paste="onPaste"
      @focus="onFocus"
      @blur="onBlur"
      @click="caretToEnd"
    />
  </div>
</template>
