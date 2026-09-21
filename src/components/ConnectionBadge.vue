<script setup lang="ts">
import { computed } from 'vue'

import type { ConnectionStatus, RelayInfo } from '@/sync/transport'

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

const dotClass = computed(() => {
  switch (props.status) {
    case 'connected':
      return props.peerCount > 0 ? 'bg-mint' : 'bg-cyan'
    case 'connecting':
      return 'bg-amber pulse'
    case 'error':
      return 'bg-alert'
    default:
      return 'bg-dust-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border border-line bg-space-800 px-2.5 py-1 text-xs text-dust-300"
    :title="`中继 ${openRelays}/${relays.length} 已连接`"
    data-testid="connection-badge"
  >
    <span class="h-2 w-2 rounded-full" :class="dotClass" />
    {{ text }}
  </span>
</template>
