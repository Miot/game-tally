<script setup lang="ts">
import { computed } from 'vue'

import { computeRanks } from '@/games/ranking'
import type { CounterId, GameDefinition } from '@/games'
import type { PlayerState } from '@/sync/messages'

import PlayerMark from './PlayerMark.vue'

/**
 * 主计分表：一张纸上写着全桌所有人的数。
 *
 * 行＝玩家，列＝资源，最右是名次。点任意一行把写字板切到那个人（他人视角只读）。
 * 表头是套印的红条。读数一律石墨 —— 纸上的数字是同一支笔写的；
 * 资源的颜色属于预印的底材（见写字板的资源标签块），不属于手写的数字。
 * 出局者整行被划掉并标「失败」，离线者的指示物画成空心 —— 状态靠记号传达，
 * 不依赖色相，色觉差异的玩家同样读得出。
 */
const props = defineProps<{
  game: GameDefinition
  players: PlayerState[]
  activeId: string | null
  myId: string | null
  heroCounterId: CounterId
  isOnline: (playerId: string) => boolean
  isEliminated: (state: PlayerState) => boolean
}>()

const emit = defineEmits<{ select: [playerId: string] }>()

const valueOf = (player: PlayerState, counterId: CounterId): number =>
  player.counters[counterId] ?? 0

/** 名次由游戏定义的排序方向决定，并列与跳号规则见 computeRanks */
const rankOf = computed(() =>
  computeRanks(props.players, props.heroCounterId, props.game.ranking.order),
)

/* 玩家列自适应，每个资源一个定宽列，名次列最窄 */
const columns = computed(() => `minmax(0,1fr) repeat(${props.game.counters.length}, 3rem) 2.25rem`)

function summaryOf(player: PlayerState): string {
  const who = player.playerId === props.myId ? '我' : player.name
  const numbers = props.game.counters
    .map((counter) => `${counter.name} ${valueOf(player, counter.id)}`)
    .join('，')
  const rank = props.isEliminated(player)
    ? props.game.elimination.label
    : `第 ${rankOf.value.get(player.playerId)} 名`
  const presence = props.isOnline(player.playerId) ? '在线' : '离线'
  return `${who}，${numbers}，${rank}，${presence}。点按查看这一栏`
}
</script>

<template>
  <section aria-label="全桌计分表">
    <!-- 套印的红表头条。读屏由每行的汇总标签代劳 -->
    <div
      class="grid items-end gap-x-1 bg-mark px-3 pt-2.5 pb-2 text-paper"
      :style="{ gridTemplateColumns: columns }"
      aria-hidden="true"
    >
      <span class="label-cn">玩家</span>
      <span v-for="counter in game.counters" :key="counter.id" class="label-cn text-right">
        {{ counter.name }}
      </span>
      <span class="label-cn text-right">名次</span>
    </div>

    <ul>
      <li v-for="player in players" :key="player.playerId" class="hair-b">
        <button
          type="button"
          class="tap pad-row relative grid w-full items-center gap-x-1 px-3 py-1.5 text-left"
          :class="player.playerId === activeId ? 'bg-paper-3' : 'bg-transparent'"
          :style="{ gridTemplateColumns: columns }"
          :data-testid="`chip-${player.playerId}`"
          :aria-pressed="player.playerId === activeId"
          :aria-label="summaryOf(player)"
          @click="emit('select', player.playerId)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <!--
              一个标记位，两种含义：红＝我的那一栏（常驻，看别人时也认得出自己），
              石墨＝此刻正在查看的那一栏。看自己时红标已足够，当前另由行底色标出。
            -->
            <span
              v-if="player.playerId === myId"
              class="h-2.5 w-2.5 shrink-0 bg-mark"
              aria-hidden="true"
            ></span>
            <span
              v-else-if="player.playerId === activeId"
              class="h-2.5 w-2.5 shrink-0 bg-graphite"
              aria-hidden="true"
            ></span>
            <span v-else class="h-2.5 w-2.5 shrink-0" aria-hidden="true"></span>

            <span class="h-5 w-5 shrink-0">
              <PlayerMark :index="player.avatar" :hollow="!isOnline(player.playerId)" />
            </span>
            <span
              class="truncate text-body"
              :class="[
                player.playerId === myId ? 'font-bold' : '',
                isOnline(player.playerId) ? 'text-graphite' : 'text-pencil',
              ]"
            >
              {{ player.playerId === myId ? '我' : player.name }}
            </span>
            <span
              v-if="isEliminated(player)"
              class="label-cn relative z-10 shrink-0 border border-mark bg-paper px-1 py-0.5 text-mark"
            >
              失败
            </span>
          </span>

          <span
            v-for="counter in game.counters"
            :key="counter.id"
            class="tabular text-right"
            :class="[
              counter.hero ? 'text-num-s font-bold' : 'text-body font-medium',
              isOnline(player.playerId) ? 'text-graphite' : 'text-pencil',
            ]"
          >
            {{ valueOf(player, counter.id) }}
          </span>

          <!--
            殖民地覆灭：一笔横穿整行，和纸上的做法一样。「失败」标签浮在它上层并自带纸底，
            横线到标签处自然断开。读数不加删除线 —— 2px 红线穿过字心会把 0 读成 Ø，
            而结算时这些数字仍然要看。
          -->
          <span
            v-if="isEliminated(player)"
            class="pointer-events-none absolute inset-x-2 top-1/2 h-[2px] bg-mark"
            aria-hidden="true"
          ></span>

          <!-- 出局的名次位留空：横穿整行的划线已经说明了结果 -->
          <span class="tabular text-right text-body text-pencil">
            {{ isEliminated(player) ? '' : rankOf.get(player.playerId) }}
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>
