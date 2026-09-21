<script setup lang="ts">
import type { CounterId } from '@/games'
import type { PlayerState } from '@/sync/messages'

import RobotAvatar from './RobotAvatar.vue'

defineProps<{
  players: PlayerState[]
  activeId: string | null
  myId: string | null
  heroCounterId: CounterId
  isOnline: (playerId: string) => boolean
  isEliminated: (state: PlayerState) => boolean
}>()

const emit = defineEmits<{ select: [playerId: string] }>()
</script>

<template>
  <nav class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="切换查看玩家">
    <button
      v-for="player in players"
      :key="player.playerId"
      type="button"
      class="tap flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5"
      :class="
        player.playerId === activeId
          ? 'border-accent bg-accent/10 shadow-glow-accent'
          : 'border-line bg-surface'
      "
      :data-testid="`chip-${player.playerId}`"
      :aria-pressed="player.playerId === activeId"
      @click="emit('select', player.playerId)"
    >
      <span class="relative h-7 w-7">
        <RobotAvatar :index="player.avatar" :offline="!isOnline(player.playerId)" />
        <span
          class="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-surface"
          :class="isOnline(player.playerId) ? 'bg-mint' : 'bg-ink-3'"
        />
      </span>
      <span class="max-w-20 truncate text-sm">
        {{ player.playerId === myId ? '我' : player.name }}
      </span>
      <span
        class="readout text-sm"
        :class="isEliminated(player) ? 'text-alert' : 'text-token-person'"
      >
        {{ player.counters[heroCounterId] ?? 0 }}
      </span>
    </button>
  </nav>
</template>
