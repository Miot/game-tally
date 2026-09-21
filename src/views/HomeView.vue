<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { showToast } from 'vant'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import ProfileEditor from '@/components/ProfileEditor.vue'
import { defaultGame } from '@/games'
import { LAST_ROOM_KEY } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '@/utils/room-code'

const router = useRouter()
const settings = useSettingsStore()
const game = defaultGame

const joinCode = ref('')
const lastRoom = useStorage<string | null>(LAST_ROOM_KEY, null)

const normalizedJoinCode = computed(() => normalizeRoomCode(joinCode.value))
const canJoin = computed(() => isValidRoomCode(normalizedJoinCode.value))

function requireName(): boolean {
  if (settings.hasName) return true
  showToast('先起个昵称，同桌才认得出你')
  return false
}

function createRoom(): void {
  if (!requireName()) return
  router.push({ name: 'room', params: { code: generateRoomCode() } })
}

function joinRoom(): void {
  if (!requireName()) return
  if (!canJoin.value) {
    showToast('房间码是 4 位字母数字')
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
  <main class="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-6 pb-10">
    <header class="flex items-center gap-3">
      <img src="/favicon.svg" alt="" class="h-12 w-12 rounded-2xl" />
      <div>
        <h1 class="text-2xl font-bold tracking-wide">局分</h1>
        <p class="font-display text-[11px] tracking-[0.35em] text-cyan uppercase">GameTally</p>
      </div>
      <router-link
        :to="{ name: 'settings' }"
        class="tap ml-auto rounded-full border border-line bg-space-800 px-3 py-1.5 text-xs text-dust-300"
      >
        设置
      </router-link>
    </header>

    <section class="panel p-4">
      <h2 class="mb-3 font-display text-xs tracking-[0.3em] text-dust-500 uppercase">我是谁</h2>
      <ProfileEditor
        v-model:name="settings.profile.name"
        v-model:avatar="settings.profile.avatar"
      />
    </section>

    <section class="panel p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">{{ game.name.zh }}</h2>
          <p class="font-display text-[11px] tracking-wider text-dust-500">{{ game.name.en }}</p>
        </div>
        <a
          :href="game.bggUrl"
          target="_blank"
          rel="noopener"
          class="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-dust-300"
        >
          BGG 资料
        </a>
      </div>
      <dl class="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="rounded-xl bg-space-900 py-2">
          <dt class="text-dust-700">人数</dt>
          <dd class="readout mt-1 text-base">{{ game.players.min }}–{{ game.players.max }}</dd>
        </div>
        <div class="rounded-xl bg-space-900 py-2">
          <dt class="text-dust-700">时长</dt>
          <dd class="readout mt-1 text-base">
            {{ game.playtimeMinutes.min }}–{{ game.playtimeMinutes.max }}
            <span class="text-[10px]">分</span>
          </dd>
        </div>
        <div class="rounded-xl bg-space-900 py-2">
          <dt class="text-dust-700">记录项</dt>
          <dd class="mt-1 text-sm">{{ game.counters.map((c) => c.name).join(' · ') }}</dd>
        </div>
      </dl>
      <p class="mt-3 text-xs leading-relaxed text-dust-500">{{ game.winCondition }}</p>
    </section>

    <van-button
      block
      round
      type="primary"
      size="large"
      data-testid="create-room"
      @click="createRoom"
    >
      创建房间
    </van-button>

    <section class="panel flex items-center gap-2 p-2">
      <input
        v-model="joinCode"
        type="text"
        inputmode="text"
        autocapitalize="characters"
        autocomplete="off"
        spellcheck="false"
        maxlength="4"
        placeholder="房间码"
        aria-label="房间码"
        data-testid="join-code"
        class="readout min-h-11 min-w-0 flex-1 rounded-xl bg-space-900 px-3 text-center text-2xl tracking-[0.3em] text-cyan uppercase placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-dust-700 focus:outline-none"
        @keyup.enter="joinRoom"
      />
      <van-button
        round
        type="primary"
        plain
        :disabled="!canJoin"
        data-testid="join-room"
        @click="joinRoom"
      >
        加入房间
      </van-button>
    </section>

    <van-button v-if="lastRoom" block round plain data-testid="resume-room" @click="resumeRoom">
      回到房间 {{ lastRoom }}
    </van-button>

    <p class="mt-auto text-center text-[11px] leading-relaxed text-dust-700">
      无需注册，同桌手机直连同步。桌游资料来自 BoardGameGeek，图形均为自绘。
    </p>
  </main>
</template>
