<script setup lang="ts">
import { computed } from 'vue'

import type { ConnectionStatus, RelayInfo } from '@/sync/transport'

/**
 * 中继状态：每个中继一枚圆点，实心＝已连、空心呼吸＝连接中、划掉＝失败。
 * 状态由记号承担，色相只是附带，因此在任何光线和任何色觉下都读得出。
 */
const props = defineProps<{
  status: ConnectionStatus
  peerCount: number
  relays: RelayInfo[]
}>()

const openRelays = computed(() => props.relays.filter((relay) => relay.state === 'open').length)

const text = computed(() => {
  switch (props.status) {
    case 'connected':
      return `${props.peerCount} 人在线`
    case 'connecting':
      return '连接中继…'
    case 'error':
      return '连接失败'
    default:
      return '未连接'
  }
})
</script>

<template>
  <span
    class="label-cn inline-flex items-center gap-1.5 text-graphite"
    :title="`中继 ${openRelays}/${relays.length} 已连接`"
    data-testid="connection-badge"
  >
    <svg
      v-if="relays.length"
      :viewBox="`0 0 ${relays.length * 9 - 2} 8`"
      class="h-2 shrink-0"
      :style="{ width: `${relays.length * 9 - 2}px` }"
      aria-hidden="true"
    >
      <g v-for="(relay, index) in relays" :key="relay.url">
        <circle
          :cx="index * 9 + 3.5"
          cy="4"
          r="3"
          :fill="relay.state === 'open' ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.2"
          :class="relay.state === 'connecting' ? 'relay-breathe' : ''"
        />
        <line
          v-if="relay.state !== 'open' && relay.state !== 'connecting'"
          :x1="index * 9 + 1"
          y1="6.5"
          :x2="index * 9 + 6"
          y2="1.5"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
        />
      </g>
    </svg>
    {{ text }}
  </span>
</template>
