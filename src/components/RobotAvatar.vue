<script setup lang="ts">
import { computed } from 'vue'

import { avatarPalette } from '@/theme/avatars'

const props = defineProps<{ index: number; offline?: boolean }>()
const palette = computed(() => avatarPalette(props.index))
</script>

<template>
  <svg
    viewBox="0 0 64 64"
    aria-hidden="true"
    class="block h-full w-full transition-opacity"
    :class="offline ? 'opacity-40 grayscale' : ''"
  >
    <path d="M32 6v8" :stroke="palette.body" stroke-width="3" stroke-linecap="round" />
    <circle cx="32" cy="6" r="3.5" :fill="palette.body" />
    <rect x="12" y="14" width="40" height="36" rx="10" :fill="palette.body" />
    <rect x="18" y="22" width="28" height="16" rx="6" :fill="palette.eye" />
    <circle cx="26" cy="30" r="3.5" :fill="palette.body" />
    <circle cx="38" cy="30" r="3.5" :fill="palette.body" />
    <rect x="22" y="43" width="20" height="3" rx="1.5" :fill="palette.eye" opacity="0.6" />
    <rect x="6" y="26" width="6" height="12" rx="3" :fill="palette.body" opacity="0.7" />
    <rect x="52" y="26" width="6" height="12" rx="3" :fill="palette.body" opacity="0.7" />
  </svg>
</template>
