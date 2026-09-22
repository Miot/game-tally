<script lang="ts">
/**
 * 图标系统：24×24 视口，统一 1.75 笔画、圆端圆接，取 currentColor。
 * 全站图标只从这里出，不使用 Unicode 字形或 emoji 代替。
 */
export type IconName =
  | 'back'
  | 'more'
  | 'close'
  | 'copy'
  | 'share'
  | 'qr'
  | 'undo'
  | 'rank'
  | 'settings'
  | 'reconnect'
  | 'reset'
  | 'leave'
  | 'tear'
  | 'forward'
  | 'expand'
  | 'check'
  | 'warning'
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: IconName; title?: string }>()

const PATHS: Record<IconName, string> = {
  back: 'M14.5 5.5 8 12l6.5 6.5',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  close: 'M6 6l12 12M18 6 6 18',
  copy: 'M8 8h11v11H8Zm-3 8V5h11v3',
  share: 'M12 15.5V4m0 0L8.2 7.8M12 4l3.8 3.8M5 13.5v5.5h14v-5.5',
  qr: 'M4.5 4.5h5v5h-5Zm10 0h5v5h-5Zm-10 10h5v5h-5Zm10 1.5v3.5m0-5v.01M18 14.5v5m1.5-2.5h-2',
  undo: 'M5.5 9.5h9a4.5 4.5 0 0 1 0 9H9M5.5 9.5 9 6M5.5 9.5 9 13',
  rank: 'M4.5 6.5h15M4.5 12h10M4.5 17.5h5.5',
  settings: 'M4 8.5h5m4 0h7M9 6h4v5H9Zm-5 9.5h8m4 0h3m-6-2.5h4v5h-4Z',
  reconnect:
    'M19 6.5v4h-4M5 17.5v-4h4M5.6 10.5a6.5 6.5 0 0 1 11.2-2.6L19 10.5M18.4 13.5a6.5 6.5 0 0 1-11.2 2.6L5 13.5',
  reset: 'M12 5.5v6.5M7.5 7.2a6.5 6.5 0 1 0 9 0',
  leave: 'M14 5.5H6v13h8M11 12h9m0 0-3.2-3.2M20 12l-3.2 3.2',
  tear: 'M6 3h8l4 4v14H6Zm8 0v4h4m-6 4v6m-3-3h6',
  forward: 'M9.5 5.5 16 12l-6.5 6.5',
  expand: 'M5.5 9 12 15.5 18.5 9',
  check: 'M5 12.5 10 17.5 19 7',
  warning: 'M12 5 3.5 19.5h17L12 5Zm0 5.5v4.5m0 2.5v.01',
}

const d = computed(() => PATHS[props.name])
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="block h-full w-full"
    :aria-hidden="title ? undefined : true"
    :role="title ? 'img' : undefined"
  >
    <title v-if="title">{{ title }}</title>
    <path :d="d" />
  </svg>
</template>
