<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PadIcon from '@/components/PadIcon.vue'
import RoomCodeInput from '@/components/RoomCodeInput.vue'
import { games, type GameDefinition } from '@/games'
import { LAST_ROOM_KEY } from '@/stores/room'
import { showToast } from '@/ui/feedback'
import { generateRoomCode, isValidRoomCode } from '@/utils/room-code'

/**
 * 首页：这本计分纸的封面。
 *
 * 版面按使用频率排：一桌人里只有一个人开局，其余三四个都是拿着房间号进来的，
 * 所以「加入」占顶部最显眼的位置，开局的游戏列表排在它下面。
 * 整页是一张纸，区块之间用规则线分栏，不切成互不相干的卡片。
 */
const router = useRouter()

/** 游戏列表按注册顺序铺成两列；新增游戏只加定义文件，这里不必改 */
const gameList = computed<GameDefinition[]>(() => [...games.values()])

const joinCode = ref('')
const lastRoom = useStorage<string | null>(LAST_ROOM_KEY, null)
/** 封面来自 BGG 图片 CDN，加载失败时退回自绘占位，入口仍可点击 */
const coverFailed = ref<Record<string, boolean>>({})

const canJoin = computed(() => isValidRoomCode(joinCode.value))

function joinRoom(): void {
  if (!canJoin.value) {
    showToast({ message: '房间号是 4 位字母数字', tone: 'alert' })
    return
  }
  router.push({ name: 'room', params: { code: joinCode.value } })
}

/**
 * 开一局。房间 ID 已经由 gameId 与房间码共同构成（见 roomIdOf），
 * 协议层支持多款游戏；等真加第二款时把 gameId 带进路由即可。
 */
function createRoom(game: GameDefinition): void {
  void game
  router.push({ name: 'room', params: { code: generateRoomCode() } })
}

function resumeRoom(): void {
  if (!lastRoom.value) return
  router.push({ name: 'room', params: { code: lastRoom.value } })
}

function heroIconOf(game: GameDefinition): string {
  return (game.counters.find((counter) => counter.hero) ?? game.counters[0]!).icon
}
</script>

<template>
  <main class="pad-page mx-auto flex min-h-dvh w-full max-w-md flex-col">
    <!-- 印在本子顶端的标志 -->
    <header class="rule-b flex items-baseline gap-2 px-3 py-2">
      <h1 class="lead text-graphite">局分</h1>
      <p class="label text-pencil">GameTally</p>
      <router-link
        :to="{ name: 'settings' }"
        class="tap label-cn ml-auto flex min-h-11 items-center gap-1.5 border-2 border-transparent px-2 text-pencil"
      >
        <span class="h-4 w-4"><PadIcon name="settings" /></span>
        设置
      </router-link>
    </header>

    <!--
      主角：拿着房间号进来。一桌人里只有一个人开局，其余都是走这条路径，
      所以它占顶部最显眼的位置，四个格子比一行小字更像「这里要填东西」。
    -->
    <section class="rule-b px-3 py-4">
      <h2 class="label-cn mb-3 text-pencil">同桌给了你房间号</h2>
      <RoomCodeInput v-model="joinCode" />
      <button
        type="button"
        class="tap tap-solid label-cn mt-3 flex min-h-14 w-full items-center justify-center gap-2 border-2 border-graphite bg-graphite px-4 text-paper"
        :disabled="!canJoin"
        data-testid="join-room"
        @click="joinRoom"
      >
        <span class="h-5 w-5"><PadIcon name="forward" /></span>
        加入这一局
      </button>
    </section>

    <button
      v-if="lastRoom"
      type="button"
      class="tap hair-b flex items-center gap-3 bg-paper-2 px-3 py-3 text-left"
      data-testid="resume-room"
      @click="resumeRoom"
    >
      <span class="min-w-0 flex-1">
        <span class="label-cn block text-pencil">上一局还没记完</span>
        <span class="tabular mt-0.5 block text-num-s font-bold tracking-[0.12em] text-graphite">
          {{ lastRoom }}
        </span>
      </span>
      <span class="label-cn flex shrink-0 items-center gap-1 text-graphite">
        回到这一局
        <span class="h-4 w-4"><PadIcon name="forward" /></span>
      </span>
    </button>

    <!-- 开一局：游戏两列铺开，新增游戏自然填进网格 -->
    <section class="px-3 py-4">
      <h2 class="label-cn mb-3 text-pencil">或者开一局</h2>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="game in gameList"
          :key="game.id"
          type="button"
          class="tap sheet flex flex-col overflow-hidden text-left"
          :data-testid="`game-${game.id}`"
          :aria-label="`用《${game.name.zh}》开一局`"
          @click="createRoom(game)"
        >
          <img
            v-if="!coverFailed[game.id]"
            :src="game.cover.src"
            :srcset="`${game.cover.thumb} 200w, ${game.cover.src} 700w`"
            sizes="(max-width: 440px) 45vw, 200px"
            :alt="game.cover.alt"
            class="aspect-square w-full bg-paper-2 object-cover"
            decoding="async"
            fetchpriority="high"
            @error="coverFailed[game.id] = true"
          />
          <div v-else class="flex aspect-square w-full items-center justify-center bg-paper-2">
            <img :src="heroIconOf(game)" alt="" class="h-16 w-16 object-contain" />
          </div>

          <span class="hair-t flex flex-col gap-1 px-2.5 py-2.5">
            <span class="label-cn text-graphite">{{ game.name.zh }}</span>
            <span class="label-cn font-normal text-pencil">
              {{ game.players.min }}–{{ game.players.max }} 人 · {{ game.playtimeMinutes.min }}–{{
                game.playtimeMinutes.max
              }}
              分
            </span>
          </span>
        </button>

        <!--
          网格里空着的那一格照样是预印好的：说清楚这是个会长的列表，
          而不是让右半边无故留白。
        -->
        <div
          class="flex flex-col items-center justify-center gap-2 border border-rule bg-paper-2 px-3 py-6 text-center"
        >
          <span class="label-cn font-normal text-pencil">更多游戏<br />陆续加入</span>
        </div>
      </div>
    </section>

    <div class="flex-1"></div>
    <p class="hair-t px-3 py-3 text-xs text-pencil">
      不用注册。同桌各自打开这一页，扫一下就在同一张计分纸上了。
    </p>
  </main>
</template>
