<script setup lang="ts">
import {
  useClipboard,
  useDocumentVisibility,
  useEventListener,
  useIntervalFn,
  useWakeLock,
} from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ConnectionBadge from '@/components/ConnectionBadge.vue'
import PadButton from '@/components/PadButton.vue'
import PadIcon, { type IconName } from '@/components/PadIcon.vue'
import PadSheet from '@/components/PadSheet.vue'
import ProfileEditor from '@/components/ProfileEditor.vue'
import RankSheet from '@/components/RankSheet.vue'
import RoomQrSheet from '@/components/RoomQrSheet.vue'
import ScorePad from '@/components/ScorePad.vue'
import ScorePadSummary from '@/components/ScorePadSummary.vue'
import WritePad from '@/components/WritePad.vue'
import { defaultGame, type CounterId } from '@/games'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import { createMqttTransport } from '@/sync/mqtt-transport'
import { showConfirm, showToast } from '@/ui/feedback'
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
/** 全桌默认折起：记自己的分是任务，看别人是次要能力 */
const tableOpen = ref(false)

const heroCounterId = computed(() => game.counters.find((c) => c.hero)?.id ?? game.counters[0]!.id)
const mineEliminated = computed(() => (room.me ? room.isEliminated(room.me) : false))

/** 房间页按游戏定义换皮：只覆盖纸、格线、印记，其余令牌继承外壳 */
const padTheme = computed(() => ({
  '--color-paper': game.theme.paper,
  '--color-rule': game.theme.rule,
  '--color-mark': game.theme.mark,
  '--color-mark-soft': `color-mix(in oklab, ${game.theme.mark} 12%, ${game.theme.paper})`,
}))

const { copy } = useClipboard({ legacy: true })
const visibility = useDocumentVisibility()
const wakeLock = useWakeLock()

async function enterRoom(): Promise<void> {
  try {
    await room.open({
      code: code.value,
      game,
      profile: { ...settings.profile },
      transport: createMqttTransport(settings.network.brokers),
    })
  } catch (error) {
    console.error(error)
    showToast({ message: '连接中继失败，请检查网络后重试', tone: 'alert' })
  }
}

onMounted(async () => {
  if (!isValidRoomCode(code.value)) {
    showToast({ message: '房间号无效', tone: 'alert' })
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
    showToast({ message: '先写下名字', tone: 'alert' })
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

/*
 * 殖民地覆灭不另做播报：计分表里那一行会被划掉并标「失败」，
 * 本人的写字板顶部还有一条横幅。痕迹留在纸上，比一闪而过的提示可靠。
 */

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

function backToMine(): void {
  if (room.myPlayerId) room.view(room.myPlayerId)
}

async function copyCode(): Promise<void> {
  await copy(code.value)
  showToast('房间号已复制')
}

interface MenuAction {
  id: string
  name: string
  icon: IconName
  destructive?: boolean
}

const menuActions: MenuAction[] = [
  { id: 'invite', name: '邀请同桌', icon: 'qr' },
  { id: 'rank', name: '合计', icon: 'rank' },
  { id: 'reconnect', name: '重新连接', icon: 'reconnect' },
  { id: 'reset', name: '重置我的一栏', icon: 'reset' },
  { id: 'settings', name: '设置与连接诊断', icon: 'settings' },
  { id: 'leave', name: '离开房间', icon: 'leave', destructive: true },
]

async function onMenuSelect(action: MenuAction): Promise<void> {
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
      if (
        await showConfirm({
          title: '重置我的一栏',
          message: `把${game.counters.map((counter) => counter.name).join('、')}擦掉，恢复成开局数值。其他人的一栏不受影响。`,
          confirmText: '重置',
          destructive: true,
        })
      ) {
        room.resetMine()
        showToast('已重置')
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
  <main class="pad-page mx-auto flex min-h-dvh w-full max-w-md flex-col" :style="padTheme">
    <!-- 计分纸表头：房间号填在这一栏，右边是中继与菜单 -->
    <header class="rule-b flex shrink-0 items-center gap-2 px-3 py-2">
      <button
        type="button"
        class="tap flex h-10 w-10 shrink-0 items-center justify-center border-2 border-transparent text-pencil"
        aria-label="返回首页"
        @click="router.push({ name: 'home' })"
      >
        <span class="h-5 w-5"><PadIcon name="back" /></span>
      </button>

      <span class="label-cn shrink-0 text-pencil">房间</span>
      <button
        type="button"
        class="tap tabular min-h-11 shrink-0 px-1 text-num-s font-bold tracking-[0.12em] text-graphite"
        data-testid="room-code"
        aria-label="复制房间号"
        @click="copyCode"
      >
        {{ code }}
      </button>

      <button
        type="button"
        class="tap flex h-10 w-10 shrink-0 items-center justify-center border-2 border-transparent text-graphite"
        aria-label="邀请同桌"
        data-testid="invite"
        @click="showQr = true"
      >
        <span class="h-5 w-5"><PadIcon name="qr" /></span>
      </button>

      <ConnectionBadge
        class="ml-auto min-w-0 shrink"
        :status="room.status"
        :peer-count="room.peerCount"
        :relays="room.relays"
      />

      <button
        type="button"
        class="tap flex h-10 w-10 shrink-0 items-center justify-center border-2 border-graphite text-graphite"
        aria-label="更多"
        @click="showMenu = true"
      >
        <span class="h-5 w-5"><PadIcon name="more" /></span>
      </button>
    </header>

    <!--
      任务是记自己的分，全桌是抬头一瞥的参照，所以全桌折成一行，
      展开才铺开整张表；写字板拿走剩下的全部高度。
    -->
    <template v-if="room.me">
      <ScorePadSummary
        class="shrink-0"
        :game="game"
        :players="room.orderedPlayers"
        :my-id="room.myPlayerId"
        :hero-counter-id="heroCounterId"
        :open="tableOpen"
        :is-online="room.isOnline"
        :is-eliminated="room.isEliminated"
        @toggle="tableOpen = !tableOpen"
      />

      <div v-if="tableOpen" class="rule-b max-h-[38dvh] shrink-0 overflow-y-auto">
        <ScorePad
          :game="game"
          :players="room.orderedPlayers"
          :active-id="room.viewingPlayerId"
          :my-id="room.myPlayerId"
          :hero-counter-id="heroCounterId"
          :is-online="room.isOnline"
          :is-eliminated="room.isEliminated"
          @select="room.view"
        />
      </div>
    </template>

    <!-- 还没入房：这张纸上一行都还没有，只留一个落点 -->
    <div
      v-else-if="!showProfile"
      class="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-pencil"
    >
      <span class="relay-breathe h-2 w-2 bg-mark" aria-hidden="true"></span>
      <p class="text-body">正在进入房间…</p>
    </div>

    <WritePad
      v-if="room.viewing"
      class="min-h-0 flex-1"
      :game="game"
      :state="room.viewing"
      :editable="room.isViewingSelf"
      :online="room.isOnline(room.viewing.playerId)"
      :eliminated="room.isViewingSelf ? mineEliminated : room.isEliminated(room.viewing)"
      :can-undo="room.canUndo"
      @adjust="onAdjust"
      @quick="onQuick"
      @undo="room.undo"
      @back-to-mine="backToMine"
    />

    <RoomQrSheet v-model:show="showQr" :code="code" :url="shareUrl" />
    <RankSheet
      v-model:show="showRank"
      :game="game"
      :ranking="room.ranking"
      :my-id="room.myPlayerId"
      :is-online="room.isOnline"
      :is-eliminated="room.isEliminated"
    />

    <PadSheet v-model:show="showMenu" title="这一局">
      <ul class="sheet">
        <li v-for="action in menuActions" :key="action.id" class="hair-b last:border-b-0">
          <button
            type="button"
            class="tap flex min-h-14 w-full items-center gap-3 px-3 text-left text-body"
            :class="action.destructive ? 'text-mark' : 'text-graphite'"
            @click="onMenuSelect(action)"
          >
            <span class="h-5 w-5 shrink-0"><PadIcon :name="action.icon" /></span>
            {{ action.name }}
          </button>
        </li>
      </ul>
    </PadSheet>

    <PadSheet v-model:show="showProfile" :dismissible="false" :title="`进入房间 ${code}`">
      <p class="mb-4 text-body text-pencil">领一个指示物、写下名字，同桌才认得出你这一栏。</p>
      <ProfileEditor
        v-model:name="settings.profile.name"
        v-model:avatar="settings.profile.avatar"
      />
      <PadButton
        class="mt-5"
        block
        variant="solid"
        data-testid="confirm-profile"
        @click="confirmProfile"
      >
        进入房间
      </PadButton>
    </PadSheet>
  </main>
</template>
