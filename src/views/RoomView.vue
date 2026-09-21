<script setup lang="ts">
import {
  useClipboard,
  useDocumentVisibility,
  useEventListener,
  useIntervalFn,
  useWakeLock,
} from '@vueuse/core'
import { showConfirmDialog, showToast } from 'vant'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ColonyBoard from '@/components/ColonyBoard.vue'
import ConnectionBadge from '@/components/ConnectionBadge.vue'
import CoverBackdrop from '@/components/CoverBackdrop.vue'
import PlayerChips from '@/components/PlayerChips.vue'
import ProfileEditor from '@/components/ProfileEditor.vue'
import RankSheet from '@/components/RankSheet.vue'
import RoomQrSheet from '@/components/RoomQrSheet.vue'
import { defaultGame, type CounterId } from '@/games'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import { createTrysteroTransport } from '@/sync/trystero-transport'
import { isValidRoomCode, normalizeRoomCode } from '@/utils/room-code'

const props = defineProps<{ code: string }>()

const router = useRouter()
const settings = useSettingsStore()
const room = useRoomStore()
const game = defaultGame

const code = computed(() => normalizeRoomCode(props.code))
const shareUrl = computed(() => `${location.origin}${location.pathname}#/r/${code.value}`)

const showProfile = ref(false)
const showQr = ref(false)
const showRank = ref(false)
const showMenu = ref(false)

const heroCounterId = computed(() => game.counters.find((c) => c.hero)?.id ?? game.counters[0]!.id)
const mineEliminated = computed(() => (room.me ? room.isEliminated(room.me) : false))

const { copy } = useClipboard({ legacy: true })
const visibility = useDocumentVisibility()
const wakeLock = useWakeLock()

async function enterRoom(): Promise<void> {
  try {
    await room.open({
      code: code.value,
      game,
      profile: { ...settings.profile },
      transport: createTrysteroTransport(settings.network),
    })
  } catch (error) {
    console.error(error)
    showToast('连接中继失败，请检查网络后重试')
  }
}

onMounted(async () => {
  if (!isValidRoomCode(code.value)) {
    showToast('房间码无效')
    router.replace({ name: 'home' })
    return
  }
  if (!settings.hasName) {
    showProfile.value = true
    return
  }
  await enterRoom()
})

async function confirmProfile(): Promise<void> {
  if (!settings.hasName) {
    showToast('先起个昵称')
    return
  }
  showProfile.value = false
  await enterRoom()
}

onBeforeUnmount(() => {
  void room.close()
  if (wakeLock.isActive.value) void wakeLock.release()
})

/* 回到前台或网络恢复时重新广播自己的状态，弥补后台期间丢失的连接 */
watch(visibility, (state) => {
  if (state === 'visible' && room.phase === 'joined') room.rebroadcast()
})
useEventListener(window, 'online', () => {
  if (room.phase === 'joined') room.rebroadcast()
})
useIntervalFn(() => room.refreshRelays(), 3000)

/* 入房成功后保持屏幕常亮，避免记分途中锁屏 */
watch(
  () => room.phase,
  (phase) => {
    if (phase === 'joined' && wakeLock.isSupported.value && !wakeLock.isActive.value) {
      void wakeLock.request('screen').catch(() => undefined)
    }
  },
)

/* 有玩家的殖民地覆灭时提示一次，符合游戏「某殖民地无人即结束」的规则 */
const announced = new Set<string>()
watch(
  () => room.ranking.map((p) => `${p.playerId}:${room.isEliminated(p)}`),
  () => {
    for (const player of room.ranking) {
      if (room.isEliminated(player) && !announced.has(player.playerId)) {
        announced.add(player.playerId)
        showToast({
          message: `${player.playerId === room.myPlayerId ? '你' : player.name}的${game.elimination.label}，本局结束`,
          duration: 3000,
        })
      } else if (!room.isEliminated(player)) {
        announced.delete(player.playerId)
      }
    }
  },
)

function vibrate(pattern: number | number[]): void {
  if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
}

function onAdjust(counterId: CounterId, delta: number): void {
  room.adjust(counterId, delta)
  vibrate(counterId === heroCounterId.value && delta < 0 ? [30, 40, 30] : 10)
}

function onQuick(actionId: string): void {
  room.applyQuickAction(actionId)
  vibrate(10)
}

async function copyCode(): Promise<void> {
  await copy(code.value)
  showToast('房间码已复制')
}

const menuActions = [
  { name: '邀请同桌', id: 'invite' },
  { name: '排行榜', id: 'rank' },
  { name: '重新连接', id: 'reconnect' },
  { name: '重置我的计数', id: 'reset', color: '#b45309' },
  { name: '设置与网络诊断', id: 'settings' },
  { name: '离开房间', id: 'leave', color: '#e11d48' },
]

async function onMenuSelect(action: { id: string }): Promise<void> {
  showMenu.value = false
  switch (action.id) {
    case 'invite':
      showQr.value = true
      break
    case 'rank':
      showRank.value = true
      break
    case 'reconnect':
      // 重新入房会立即向中继重新公告，用于公共中继丢弃首个公告时加速对等端发现
      await enterRoom()
      showToast('已重新连接中继')
      break
    case 'reset':
      try {
        await showConfirmDialog({
          title: '重置我的计数',
          message: '把幸存者、钱、食物恢复为开局数值，其他玩家不受影响。',
          confirmButtonText: '重置',
        })
        room.resetMine()
        showToast('已重置')
      } catch {
        // 用户取消
      }
      break
    case 'settings':
      router.push({ name: 'settings' })
      break
    case 'leave':
      await room.close({ forget: true })
      router.replace({ name: 'home' })
      break
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 px-4 pt-3 pb-8">
    <CoverBackdrop :cover="game.cover" />
    <header class="flex items-center gap-2">
      <button
        type="button"
        class="tap flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2"
        aria-label="返回首页"
        @click="router.push({ name: 'home' })"
      >
        ←
      </button>
      <button
        type="button"
        class="tap readout flex-1 rounded-full border border-line bg-surface py-2 text-center text-xl tracking-[0.3em] text-accent-deep"
        data-testid="room-code"
        aria-label="复制房间码"
        @click="copyCode"
      >
        {{ code }}
      </button>
      <ConnectionBadge :status="room.status" :peer-count="room.peerCount" :relays="room.relays" />
      <button
        type="button"
        class="tap flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2"
        aria-label="更多"
        @click="showMenu = true"
      >
        ⋯
      </button>
    </header>

    <PlayerChips
      v-if="room.me"
      :players="room.orderedPlayers"
      :active-id="room.viewingPlayerId"
      :my-id="room.myPlayerId"
      :hero-counter-id="heroCounterId"
      :is-online="room.isOnline"
      :is-eliminated="room.isEliminated"
      @select="room.view"
    />

    <div
      v-if="room.viewing && !room.isViewingSelf"
      class="flex items-center justify-between rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-amber-deep"
      data-testid="readonly-banner"
    >
      <span>只读 · 正在查看 {{ room.viewing.name }} 的殖民地</span>
      <button
        type="button"
        class="tap font-medium underline"
        @click="room.myPlayerId && room.view(room.myPlayerId)"
      >
        回到我的
      </button>
    </div>

    <p
      v-if="mineEliminated && room.isViewingSelf"
      class="rounded-xl border border-alert/50 bg-alert/10 px-3 py-2 text-center text-sm text-alert"
    >
      你的{{ game.elimination.label }}了。按规则本局在此结束，可在排行榜查看结果。
    </p>

    <ColonyBoard
      v-if="room.viewing"
      :game="game"
      :state="room.viewing"
      :editable="room.isViewingSelf"
      :online="room.isOnline(room.viewing.playerId)"
      :eliminated="room.isEliminated(room.viewing)"
      :can-undo="room.canUndo"
      @adjust="onAdjust"
      @quick="onQuick"
      @undo="room.undo"
    />

    <div v-else-if="!showProfile" class="panel flex flex-col items-center gap-2 p-8 text-ink-2">
      <span class="h-3 w-3 rounded-full bg-amber pulse" />
      <p class="text-sm">正在进入房间…</p>
    </div>

    <RoomQrSheet v-model:show="showQr" :code="code" :url="shareUrl" />
    <RankSheet
      v-model:show="showRank"
      :game="game"
      :ranking="room.ranking"
      :my-id="room.myPlayerId"
      :is-online="room.isOnline"
      :is-eliminated="room.isEliminated"
    />
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      close-on-click-action
      @select="onMenuSelect"
    />

    <van-popup
      v-model:show="showProfile"
      position="bottom"
      round
      :close-on-click-overlay="false"
      safe-area-inset-bottom
    >
      <div class="px-4 pt-5 pb-6">
        <h2 class="font-display text-sm tracking-[0.3em] text-ink-2 uppercase">
          进入房间 {{ code }}
        </h2>
        <p class="mt-1 mb-4 text-xs text-ink-3">先选一个机器人并起名，同桌才认得出你。</p>
        <ProfileEditor
          v-model:name="settings.profile.name"
          v-model:avatar="settings.profile.avatar"
        />
        <van-button
          class="mt-4"
          block
          round
          type="primary"
          data-testid="confirm-profile"
          @click="confirmProfile"
        >
          进入房间
        </van-button>
      </div>
    </van-popup>
  </main>
</template>
