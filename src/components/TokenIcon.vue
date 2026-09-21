<script setup lang="ts">
import type { TokenKind } from '@/games'

/** 三种 token 的矢量图形，颜色随 currentColor，尺寸由父级控制 */
defineProps<{ kind: TokenKind }>()
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" class="block h-full w-full">
    <template v-if="kind === 'person'">
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.12" />
      <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.5" />
      <path
        d="M17 50c0-8.3 6.7-15 15-15s15 6.7 15 15"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle cx="32" cy="24" r="10" stroke="currentColor" stroke-width="4" />
      <path
        d="M26 24a6 6 0 0 1 12 0"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="kind === 'coin'">
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.14" />
      <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.5" />
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke="currentColor"
        stroke-width="2"
        stroke-dasharray="3 4"
      />
      <path d="M38 20a13 13 0 1 0 0 24 10 10 0 0 1 0-24z" fill="currentColor" />
    </template>

    <template v-else>
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.12" />
      <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.5" />
      <rect x="19" y="18" width="26" height="30" rx="5" stroke="currentColor" stroke-width="3.5" />
      <path d="M19 27h26M19 39h26" stroke="currentColor" stroke-width="3" />
      <path d="M27 33h10" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    </template>
  </svg>
</template>
