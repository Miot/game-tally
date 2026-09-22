<script setup lang="ts">
import { computed } from 'vue'

import type { CounterId, GameDefinition } from '@/games'
import { computeRanks } from '@/games/ranking'
import type { PlayerState } from '@/sync/messages'

import PadIcon from './PadIcon.vue'
import PlayerMark from './PlayerMark.vue'

/**
 * 全桌一览的折叠条。
 *
 * 记分的主体是你自己那一栏，全桌只是抬头一瞥的参照，所以默认折成一行。
 * 折叠状态下必须保住两件事：谁在领先、我在第几。有人出局时这一行转为警示——
 * 「某人的殖民地无人即本局结束」是规则层面的信息，不能因为折叠就看不见。
 */
const props = defineProps<{
  game: GameDefinition
  players: PlayerState[]
  myId: string | null
  heroCounterId: CounterId
  open: boolean
  isEliminated: (state: PlayerState) => boolean
  isOnline: (playerId: string) => boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const ranks = computed(() =>
  computeRanks(props.players, props.heroCounterId, props.game.ranking.order),
)

const leader = computed(
  () => props.players.find((player) => ranks.value.get(player.playerId) === 1) ?? null,
)

const myRank = computed(() => (props.myId ? (ranks.value.get(props.myId) ?? null) : null))

const fallen = computed(() => props.players.filter((player) => props.isEliminated(player)))

const heroValue = (player: PlayerState) => player.counters[props.heroCounterId] ?? 0

const label = computed(() =>
  props.open ? '收起全桌' : fallen.value.length ? '展开全桌，查看结果' : '展开全桌',
)
</script>

<template>
  <button
    type="button"
    class="tap hair-b flex min-h-12 w-full items-center gap-2 px-3 py-2 text-left"
    :class="fallen.length ? 'bg-mark-soft' : 'bg-paper-2'"
    :aria-expanded="open"
    :aria-label="label"
    data-testid="table-summary"
    @click="emit('toggle')"
  >
    <template v-if="fallen.length">
      <span class="h-4 w-4 shrink-0 text-mark"><PadIcon name="warning" /></span>
      <span class="label-cn min-w-0 flex-1 truncate text-mark">
        {{ fallen.length === 1 ? `${fallen[0]!.name}的` : `${fallen.length} 人的` }}
        {{ game.elimination.label }}，本局结束
      </span>
    </template>

    <template v-else-if="players.length <= 1">
      <span class="label-cn flex-1 text-pencil">只有你一个人</span>
    </template>

    <template v-else-if="leader">
      <span class="label-cn shrink-0 text-pencil">领先</span>
      <span class="h-5 w-5 shrink-0">
        <PlayerMark :index="leader.avatar" :hollow="!isOnline(leader.playerId)" />
      </span>
      <span class="min-w-0 truncate text-body font-bold text-graphite">
        {{ leader.playerId === myId ? '我' : leader.name }}
      </span>
      <span class="tabular shrink-0 text-num-m font-bold text-graphite">
        {{ heroValue(leader) }}
      </span>
      <span v-if="myRank" class="label-cn ml-auto shrink-0 text-pencil">
        我第 {{ myRank }} · 共 {{ players.length }} 人
      </span>
    </template>

    <span v-else class="label-cn flex-1 text-pencil">还没有人在这张纸上</span>

    <span
      class="ml-auto h-5 w-5 shrink-0 text-pencil transition-transform"
      :class="open ? 'rotate-180' : ''"
      aria-hidden="true"
    >
      <PadIcon name="expand" />
    </span>
  </button>
</template>
