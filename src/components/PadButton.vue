<script setup lang="ts">
/**
 * 方形印刷按钮。计分纸上没有圆角，按钮是盖在纸上的一块实心印记或一个空框。
 * solid 用于主行动，outline 用于并列行动，quiet 用于行内的次要链接式操作。
 */
withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'quiet'
    tone?: 'graphite' | 'mark'
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'outline', tone: 'graphite', block: false, disabled: false, type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="tap label-cn inline-flex min-h-11 items-center justify-center gap-1.5 border-2 px-4 py-2"
    :class="[
      block ? 'w-full' : '',
      variant === 'solid'
        ? tone === 'mark'
          ? 'border-mark bg-mark text-paper'
          : 'border-graphite bg-graphite text-paper'
        : variant === 'outline'
          ? tone === 'mark'
            ? 'border-mark bg-paper text-mark'
            : 'border-graphite bg-paper text-graphite'
          : 'min-h-0 border-transparent bg-transparent px-0 py-1 text-pencil underline',
    ]"
  >
    <slot />
  </button>
</template>
