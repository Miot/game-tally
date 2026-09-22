<script setup lang="ts">
import { computed } from 'vue'

import { playerMarker, type MarkerShape } from '@/theme/markers'

const props = defineProps<{
  index: number
  /** 离线者的指示物留在桌上但不再更新，画成空心 */
  hollow?: boolean
}>()

const marker = computed(() => playerMarker(props.index))

/* 24×24 视口内的实心多边形，均留 2px 余量以便描边不被裁切 */
const PATHS: Record<MarkerShape, string> = {
  disc: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
  square: 'M3 3h18v18H3Z',
  triangle: 'M12 2.5 22.5 21H1.5Z',
  diamond: 'M12 1.5 22.5 12 12 22.5 1.5 12Z',
  pentagon: 'M12 1.8 22.6 9.5l-4 12.5H5.4l-4-12.5Z',
  hexagon: 'M8.1 2.2h7.8L21.8 12l-5.9 9.8H8.1L2.2 12Z',
  star: 'M12 1.6l3 7h7.4l-6 4.6 2.3 7.4L12 16.1l-6.7 4.5 2.3-7.4-6-4.6H9Z',
  cross: 'M8.4 2.4h7.2v6h6v7.2h-6v6H8.4v-6h-6V8.4h6Z',
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    class="block h-full w-full"
    :class="hollow ? 'opacity-70' : ''"
    aria-hidden="true"
  >
    <path
      :d="PATHS[marker.shape]"
      :fill="props.hollow ? 'none' : marker.ink"
      :stroke="marker.ink"
      :stroke-width="props.hollow ? 2.4 : 0"
      stroke-linejoin="round"
    />
  </svg>
</template>
