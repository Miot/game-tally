<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { showToast } from 'vant'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import ProfileEditor from '@/components/ProfileEditor.vue'
import TokenIcon from '@/components/TokenIcon.vue'
import { defaultGame } from '@/games'
import { LAST_ROOM_KEY } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '@/utils/room-code'

const router = useRouter()
const settings = useSettingsStore()
const game = defaultGame

const joinCode = ref('')
const lastRoom = useStorage<string | null>(LAST_ROOM_KEY, null)
/** 封面来自 BGG 图片 CDN，加载失败时退回自绘占位，入口仍可点击 */
const coverFailed = ref(false)

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
      <img src="/favicon.svg" alt="" class="h-12 w-12 rounded-2xl shadow-sm" />
      <div>
        <h1 class="text-2xl font-bold tracking-wide">局分</h1>
        <p class="font-display text-[11px] tracking-[0.35em] text-accent-deep uppercase">
          GameTally
        </p>
      </div>
      <router-link
        :to="{ name: 'settings' }"
        class="tap ml-auto rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-2 shadow-sm"
      >
        设置
      </router-link>
    </header>

    <section class="panel p-4">
      <h2 class="mb-3 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">我是谁</h2>
      <ProfileEditor
        v-model:name="settings.profile.name"
        v-model:avatar="settings.profile.avatar"
      />
    </section>

    <section class="panel overflow-hidden">
      <button
        type="button"
        class="tap relative block w-full text-left"
        data-testid="create-room"
        :aria-label="`用《${game.name.zh}》创建房间`"
        @click="createRoom"
      >
        <img
          v-if="!coverFailed"
          :src="game.cover.src"
          :srcset="`${game.cover.src} 1x, ${game.cover.src2x} 2x`"
          :alt="game.cover.alt"
          class="aspect-square w-full bg-surface-2 object-cover"
          decoding="async"
          fetchpriority="high"
          @error="coverFailed = true"
        />
        <div v-else class="flex aspect-square w-full items-center justify-center bg-surface-2">
          <span class="h-28 w-28 text-token-person">
            <TokenIcon kind="person" />
          </span>
        </div>
        <div
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent px-4 pt-12 pb-4 text-white"
        >
          <p class="font-display text-[11px] tracking-[0.25em] text-white/80 uppercase">
            {{ game.name.en }}
          </p>
          <h2 class="text-2xl font-bold">{{ game.name.zh }}</h2>
        </div>
        <span
          class="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-accent-deep shadow"
        >
          创建房间 →
        </span>
      </button>

      <div class="p-4">
        <dl class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="rounded-xl bg-surface-2 py-2">
            <dt class="text-ink-3">人数</dt>
            <dd class="readout mt-1 text-base">{{ game.players.min }}–{{ game.players.max }}</dd>
          </div>
          <div class="rounded-xl bg-surface-2 py-2">
            <dt class="text-ink-3">时长</dt>
            <dd class="readout mt-1 text-base">
              {{ game.playtimeMinutes.min }}–{{ game.playtimeMinutes.max }}
              <span class="text-[10px]">分</span>
            </dd>
          </div>
          <div class="rounded-xl bg-surface-2 py-2">
            <dt class="text-ink-3">记录项</dt>
            <dd class="mt-1 text-sm">{{ game.counters.map((c) => c.name).join(' · ') }}</dd>
          </div>
        </dl>
        <p class="mt-3 text-xs leading-relaxed text-ink-2">{{ game.winCondition }}</p>
        <div class="mt-3 flex items-center justify-between text-[11px] text-ink-3">
          <span>{{ game.designer }} · {{ game.publisher }} · {{ game.year }}</span>
          <a :href="game.bggUrl" target="_blank" rel="noopener" class="text-accent-deep underline">
            BGG 资料
          </a>
        </div>
      </div>
    </section>

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
        class="readout min-h-11 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 text-center text-2xl tracking-[0.3em] text-accent-deep uppercase placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-ink-3 focus:outline-none"
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

    <p class="mt-auto text-center text-[11px] leading-relaxed text-ink-3">
      无需注册，同桌手机直连同步。桌游资料与封面来自 BoardGameGeek。
    </p>
  </main>
</template>
