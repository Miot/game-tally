<script setup lang="ts">
import { computed } from 'vue'

import { computeRanks } from '@/games/ranking'
import type { GameDefinition } from '@/games'
import type { PlayerState } from '@/sync/messages'

import PadSheet from './PadSheet.vue'
import PlayerMark from './PlayerMark.vue'

/** 合计页：计分纸最后那张，结算时撕下来看的一张。 */
const props = defineProps<{
  game: GameDefinition
  ranking: PlayerState[]
  myId: string | null
  isOnline: (playerId: string) => boolean
  isEliminated: (state: PlayerState) => boolean
}>()

const show = defineModel<boolean>('show', { required: true })

const heroCounterId = computed(
  () => props.game.counters.find((counter) => counter.hero)?.id ?? props.game.counters[0]!.id,
)

/** 与计分表共用一套名次规则，两处不再各写一遍 */
const rankOf = computed(() =>
  computeRanks(props.ranking, heroCounterId.value, props.game.ranking.order),
)

const columns = computed(() => `1.75rem minmax(0,1fr) repeat(${props.game.counters.length}, 3rem)`)
</script>

<template>
  <PadSheet v-model:show="show" title="合计">
    <p class="mb-3 text-body text-pencil">{{ game.winCondition }}</p>

    <div class="sheet">
      <div
        class="grid items-end gap-x-1 bg-mark px-3 pt-2.5 pb-2 text-paper"
        :style="{ gridTemplateColumns: columns }"
        aria-hidden="true"
      >
        <span class="label-cn">#</span>
        <span class="label-cn">玩家</span>
        <span v-for="counter in game.counters" :key="counter.id" class="label-cn text-right">
          {{ counter.name }}
        </span>
      </div>

      <ol class="rule-t">
        <li
          v-for="player in ranking"
          :key="player.playerId"
          class="hair-b pad-row relative grid items-center gap-x-1 px-3 py-1.5 last:border-b-0"
          :style="{ gridTemplateColumns: columns }"
        >
          <!-- 出局的名次位留空，整行的划线已经说明了结果 -->
          <span class="tabular text-body font-bold text-graphite">
            {{ isEliminated(player) ? '' : rankOf.get(player.playerId) }}
          </span>

          <span class="flex min-w-0 items-center gap-2">
            <span class="h-5 w-5 shrink-0">
              <PlayerMark :index="player.avatar" :hollow="!isOnline(player.playerId)" />
            </span>
            <span class="truncate text-body" :class="[player.playerId === myId ? 'font-bold' : '']">
              {{ player.name }}{{ player.playerId === myId ? '（我）' : '' }}
            </span>
          </span>

          <!-- 与计分表同一笔：横穿整行，不碰读数 -->
          <span
            v-if="isEliminated(player)"
            class="pointer-events-none absolute inset-x-2 top-1/2 h-[2px] bg-mark"
            aria-hidden="true"
          ></span>

          <span
            v-for="counter in game.counters"
            :key="counter.id"
            class="tabular text-right"
            :class="[
              counter.hero ? 'text-num-s font-bold' : 'text-body',
              isOnline(player.playerId) ? 'text-graphite' : 'text-pencil',
            ]"
          >
            {{ player.counters[counter.id] ?? 0 }}
          </span>
        </li>
      </ol>
      <!-- 合计收尾线：计分纸上最后那一条红线 -->
      <div class="border-t-2 border-mark" aria-hidden="true"></div>
    </div>

    <p class="mt-3 text-body text-pencil">
      离线的玩家用空心指示物标出，数字停留在最后一次同步的结果。
    </p>
  </PadSheet>
</template>
