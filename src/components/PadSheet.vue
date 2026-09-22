<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import PadIcon from './PadIcon.vue'

/**
 * 从底部抽出的一联纸。没有圆角，顶边是一条 2px 石墨规则线，
 * 与主表用同一张纸，只是叠在上面。
 */
const props = withDefaults(
  defineProps<{
    title: string
    /** 点遮罩是否关闭，需要用户明确作答时关掉 */
    dismissible?: boolean
  }>(),
  { dismissible: true },
)

const show = defineModel<boolean>('show', { required: true })
const panel = ref<HTMLElement | null>(null)

function close(): void {
  if (props.dismissible) show.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

/* 打开时把焦点移进面板，关闭时交还给页面，键盘用户不会掉到遮罩后面 */
watch(show, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) return
  await nextTick()
  panel.value?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="pad-sheet">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end justify-center"
        @keydown="onKeydown"
      >
        <div class="absolute inset-0 bg-graphite/45" :aria-hidden="true" @click="close"></div>

        <section
          ref="panel"
          class="relative flex max-h-[86dvh] w-full max-w-md flex-col border-t-2 border-graphite bg-paper focus:outline-none"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <header class="flex items-start gap-3 px-4 pt-4 pb-3">
            <h2 class="label-cn flex-1 pt-1 text-graphite">{{ title }}</h2>
            <button
              type="button"
              class="tap -mt-1 -mr-1 flex h-10 w-10 items-center justify-center border-2 border-transparent text-pencil"
              aria-label="关闭"
              @click="show = false"
            >
              <span class="h-5 w-5"><PadIcon name="close" /></span>
            </button>
          </header>

          <div
            class="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 纸张的运动只有平移，没有缩放与弹跳 */
.pad-sheet-enter-active,
.pad-sheet-leave-active {
  transition: opacity 180ms ease-out;
}
.pad-sheet-enter-active section,
.pad-sheet-leave-active section {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pad-sheet-enter-from,
.pad-sheet-leave-to {
  opacity: 0;
}
.pad-sheet-enter-from section,
.pad-sheet-leave-to section {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .pad-sheet-enter-active section,
  .pad-sheet-leave-active section {
    transition-duration: 1ms;
  }
}
</style>
