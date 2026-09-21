<script setup lang="ts">
import type { GameDefinition } from '@/games'
import type { PlayerState } from '@/sync/messages'

import RobotAvatar from './RobotAvatar.vue'
import TokenIcon from './TokenIcon.vue'

defineProps<{
  game: GameDefinition
  ranking: PlayerState[]
  myId: string | null
  isOnline: (playerId: string) => boolean
  isEliminated: (state: PlayerState) => boolean
}>()

const show = defineModel<boolean>('show', { required: true })
</script>

<template>
  <van-popup v-model:show="show" position="bottom" round closeable safe-area-inset-bottom>
    <div class="px-4 pt-4 pb-6">
      <h2 class="font-display text-sm tracking-[0.3em] text-ink-2 uppercase">排行榜</h2>
      <p class="mt-1 text-xs text-ink-3">{{ game.winCondition }}</p>
      <ol class="mt-4 flex flex-col gap-2">
        <li
          v-for="(player, index) in ranking"
          :key="player.playerId"
          class="panel flex items-center gap-3 p-3"
          :class="index === 0 && !isEliminated(player) ? 'border-amber/60' : ''"
        >
          <span
            class="readout w-6 text-center text-lg"
            :class="index === 0 ? 'text-amber-deep' : 'text-ink-2'"
          >
            {{ index + 1 }}
          </span>
          <span class="h-9 w-9 shrink-0">
            <RobotAvatar :index="player.avatar" :offline="!isOnline(player.playerId)" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium">
              {{ player.name
              }}<span v-if="player.playerId === myId" class="text-ink-2">（我）</span>
            </span>
            <span v-if="isEliminated(player)" class="text-xs text-alert">
              {{ game.elimination.label }}
            </span>
            <span v-else class="text-xs text-ink-2">{{
              isOnline(player.playerId) ? '在线' : '离线'
            }}</span>
          </span>
          <span class="flex items-center gap-3">
            <span
              v-for="counter in game.counters"
              :key="counter.id"
              class="flex items-center gap-1"
              :class="counter.hero ? 'text-token-person' : 'text-ink-2'"
            >
              <span
                class="h-4 w-4"
                :class="
                  counter.token === 'coin'
                    ? 'text-token-coin'
                    : counter.token === 'food'
                      ? 'text-token-food'
                      : ''
                "
              >
                <TokenIcon :kind="counter.token" />
              </span>
              <span class="readout" :class="counter.hero ? 'text-xl' : 'text-sm'">
                {{ player.counters[counter.id] ?? 0 }}
              </span>
            </span>
          </span>
        </li>
      </ol>
    </div>
  </van-popup>
</template>
