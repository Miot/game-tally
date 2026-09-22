<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { activeConfirm, activeToasts, settleConfirm } from '@/ui/feedback'

import PadButton from './PadButton.vue'
import PadIcon from './PadIcon.vue'

/**
 * 便条与确认便签的渲染宿主，挂在应用外壳上。
 * 便条贴在顶部，确认便签压在页面中间；两者都是纸，不是卡片。
 */
const confirmPanel = ref<HTMLElement | null>(null)

watch(
  () => activeConfirm.value !== null,
  async (open) => {
    if (!open) return
    await nextTick()
    confirmPanel.value?.querySelector('button')?.focus()
  },
)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') settleConfirm(false)
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col-reverse items-center gap-2 px-4 pb-[calc(var(--pad-board-h,0px)+max(1rem,env(safe-area-inset-bottom)))]"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="pad-slip">
      <p
        v-for="toast in activeToasts"
        :key="toast.id"
        class="flex max-w-md items-center gap-2 border-2 bg-paper px-3 py-2 text-body shadow-lift"
        :class="toast.tone === 'alert' ? 'border-mark text-mark' : 'border-graphite text-graphite'"
      >
        <span v-if="toast.tone === 'alert'" class="h-4 w-4 shrink-0">
          <PadIcon name="warning" />
        </span>
        {{ toast.message }}
      </p>
    </TransitionGroup>
  </div>

  <Teleport to="body">
    <Transition name="pad-slip">
      <div
        v-if="activeConfirm"
        class="fixed inset-0 z-[70] flex items-center justify-center px-6"
        @keydown="onKeydown"
      >
        <div class="absolute inset-0 bg-graphite/45" aria-hidden="true"></div>
        <div
          ref="confirmPanel"
          class="relative w-full max-w-sm border-2 border-graphite bg-paper shadow-lift"
          role="alertdialog"
          aria-modal="true"
          :aria-label="activeConfirm.title"
        >
          <h2 class="label-cn border-b border-rule px-4 py-3 text-graphite">
            {{ activeConfirm.title }}
          </h2>
          <p class="px-4 py-4 text-body text-graphite">{{ activeConfirm.message }}</p>
          <div class="flex gap-2 px-4 pb-4">
            <PadButton block variant="outline" @click="settleConfirm(false)">
              {{ activeConfirm.cancelText ?? '取消' }}
            </PadButton>
            <PadButton
              block
              variant="solid"
              :tone="activeConfirm.destructive ? 'mark' : 'graphite'"
              @click="settleConfirm(true)"
            >
              {{ activeConfirm.confirmText ?? '确定' }}
            </PadButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pad-slip-enter-active,
.pad-slip-leave-active {
  transition:
    opacity 160ms ease-out,
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pad-slip-enter-from,
.pad-slip-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.pad-slip-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .pad-slip-enter-active,
  .pad-slip-leave-active {
    transition-duration: 1ms;
  }
}
</style>
