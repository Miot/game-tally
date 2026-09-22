<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PadIcon from '@/components/PadIcon.vue'
import { defaultGame } from '@/games'
import { LAST_ROOM_KEY } from '@/stores/room'
import { showToast } from '@/ui/feedback'
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '@/utils/room-code'

/**
 * 首页：这本计分纸的封面。
 * 整页是一张纸，区块之间用规则线分栏，不切成互不相干的卡片。
 */
const router = useRouter()
const game = defaultGame
const heroCounter = game.counters.find((c) => c.hero) ?? game.counters[0]!

const joinCode = ref('')
const lastRoom = useStorage<string | null>(LAST_ROOM_KEY, null)
/** 封面来自 BGG 图片 CDN，加载失败时退回自绘占位，入口仍可点击 */
const coverFailed = ref(false)

const normalizedJoinCode = computed(() => normalizeRoomCode(joinCode.value))
const canJoin = computed(() => isValidRoomCode(normalizedJoinCode.value))

/** 昵称在房间页首次进入时补填，首页不再拦截 */
function createRoom(): void {
  router.push({ name: 'room', params: { code: generateRoomCode() } })
}

function joinRoom(): void {
  if (!canJoin.value) {
    showToast({ message: '房间号是 4 位字母数字', tone: 'alert' })
    return
  }
  router.push({ name: 'room', params: { code: normalizedJoinCode.value } })
}

function resumeRoom(): void {
  if (!lastRoom.value) return
  router.push({ name: 'room', params: { code: lastRoom.value } })
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

    <button
      v-if="lastRoom"
      type="button"
      class="tap rule-b flex items-center gap-3 bg-paper-2 px-3 py-3 text-left"
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

    <!-- 这本计分纸是给哪款游戏用的：封面贴在本子上 -->
    <div class="px-3 pt-3">
      <img
        v-if="!coverFailed"
        :src="game.cover.src"
        :srcset="`${game.cover.src} 1x, ${game.cover.src2x} 2x`"
        :alt="game.cover.alt"
        class="aspect-square w-full border-2 border-graphite object-cover"
        decoding="async"
        fetchpriority="high"
        @error="coverFailed = true"
      />
      <div
        v-else
        class="flex aspect-square w-full items-center justify-center border-2 border-graphite bg-paper-2"
      >
        <img :src="heroCounter.icon" :alt="heroCounter.name" class="h-28 w-28 object-contain" />
      </div>
    </div>

    <div class="px-3 py-3">
      <h2 class="lead text-graphite">{{ game.name.zh }}</h2>
      <p class="label mt-1 text-pencil">{{ game.name.en }}</p>
    </div>

    <!-- 「记这些」的值最长，三等分列在窄屏上放不下，给它整行 -->
    <dl class="hair-t grid grid-cols-2 text-center">
      <div class="hair-r px-2 py-2.5">
        <dt class="label-cn text-pencil">人数</dt>
        <dd class="tabular mt-1 text-body font-bold text-graphite">
          {{ game.players.min }}–{{ game.players.max }}
        </dd>
      </div>
      <div class="px-2 py-2.5">
        <dt class="label-cn text-pencil">时长</dt>
        <dd class="tabular mt-1 text-body font-bold text-graphite">
          {{ game.playtimeMinutes.min }}–{{ game.playtimeMinutes.max }} 分
        </dd>
      </div>
      <div class="hair-t col-span-2 px-2 py-2.5">
        <dt class="label-cn text-pencil">记这些</dt>
        <dd class="mt-1 text-body font-bold text-graphite">
          {{ game.counters.map((c) => c.name).join('·') }}
        </dd>
      </div>
    </dl>

    <p class="hair-t px-3 py-3 text-body text-pencil">{{ game.winCondition }}</p>

    <div class="rule-t px-3 py-3">
      <button
        type="button"
        class="tap tap-solid label-cn flex min-h-14 w-full items-center justify-center gap-2 border-2 border-graphite bg-graphite px-4 text-paper"
        data-testid="create-room"
        :aria-label="`用《${game.name.zh}》开一局`"
        @click="createRoom"
      >
        <span class="h-5 w-5"><PadIcon name="tear" /></span>
        开一局，拿房间号
      </button>
    </div>

    <!-- 已有房间号：填在这一栏 -->
    <div class="hair-t flex items-end gap-2 px-3 py-3">
      <label class="min-w-0 flex-1">
        <span class="label-cn mb-1 block text-pencil">同桌给了你房间号</span>
        <input
          v-model="joinCode"
          type="text"
          inputmode="text"
          autocapitalize="characters"
          autocomplete="off"
          spellcheck="false"
          maxlength="4"
          placeholder="四位"
          aria-label="房间号"
          data-testid="join-code"
          class="tabular block min-h-11 w-full border-0 border-b border-rule bg-transparent px-0 py-1 text-num-s font-bold tracking-[0.2em] text-graphite uppercase placeholder:text-body placeholder:font-normal placeholder:tracking-normal placeholder:text-pencil focus:border-b-2 focus:border-graphite focus:outline-none"
          @keyup.enter="joinRoom"
        />
      </label>
      <button
        type="button"
        class="tap label-cn min-h-11 shrink-0 border-2 border-graphite bg-paper px-4 text-graphite"
        :disabled="!canJoin"
        data-testid="join-room"
        @click="joinRoom"
      >
        加入
      </button>
    </div>

    <div class="flex-1"></div>
    <p class="hair-t px-3 py-3 text-body text-pencil">
      不用注册。同桌各自打开这一页，扫一下就在同一张计分纸上了。桌游资料与封面来自 BoardGameGeek。
    </p>
  </main>
</template>
