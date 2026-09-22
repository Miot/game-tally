<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import PadButton from '@/components/PadButton.vue'
import PadField from '@/components/PadField.vue'
import PadIcon from '@/components/PadIcon.vue'
import ProfileEditor from '@/components/ProfileEditor.vue'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'
import { showToast } from '@/ui/feedback'

/** 附注栏：计分纸背面写规格与备注的那一面。 */
const router = useRouter()
const settings = useSettingsStore()
const room = useRoomStore()

const brokerText = computed({
  get: () => settings.network.brokers.join('\n'),
  set: (value: string) => {
    settings.network.brokers = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  },
})

/** 中继状态转成纸面读得懂的说法，同时给出对应的记号 */
const RELAY_STATE_TEXT: Record<string, string> = {
  open: '已连接',
  connecting: '连接中',
}

function relayText(state: string): string {
  return RELAY_STATE_TEXT[state] ?? '未连接'
}

function resetNetwork(): void {
  settings.resetNetwork()
  showToast('已恢复默认中继')
}

function goBack(): void {
  if (room.phase === 'joined') room.updateProfile({ ...settings.profile })
  router.back()
}

function rebroadcast(): void {
  room.rebroadcast()
  showToast('已重新广播')
}
</script>

<template>
  <main class="pad-page mx-auto flex min-h-dvh w-full max-w-md flex-col">
    <header class="rule-b flex items-center gap-2 px-3 py-2">
      <button
        type="button"
        class="tap flex h-10 w-10 shrink-0 items-center justify-center border-2 border-transparent text-pencil"
        aria-label="返回"
        @click="goBack"
      >
        <span class="h-5 w-5"><PadIcon name="back" /></span>
      </button>
      <h1 class="lead text-graphite">附注</h1>
    </header>

    <section class="hair-b px-3 py-4">
      <h2 class="label-cn mb-3 text-pencil">我是谁</h2>
      <ProfileEditor
        v-model:name="settings.profile.name"
        v-model:avatar="settings.profile.avatar"
      />
      <p v-if="room.phase === 'joined'" class="mt-3 text-body text-pencil">
        返回房间时会把新名字同步给同桌。
      </p>
    </section>

    <section class="hair-b px-3 py-4">
      <h2 class="label-cn text-pencil">中继服务器</h2>
      <p class="mt-1 mb-2 text-body text-pencil">
        计分数据经这些公共 MQTT 中继转发，多个并连做冗余。每行一个，下次进入房间生效。
      </p>
      <PadField
        v-model="brokerText"
        label="中继地址"
        hide-label
        :rows="3"
        placeholder="wss://host:port/mqtt"
      />
      <PadButton class="mt-3" variant="outline" @click="resetNetwork">恢复默认中继</PadButton>
    </section>

    <section>
      <h2 class="label-cn px-3 pt-4 pb-2 text-pencil">连接诊断</h2>

      <dl class="hair-t">
        <div class="hair-b flex items-baseline justify-between gap-3 px-3 py-2">
          <dt class="label-cn shrink-0 text-pencil">本机对等端</dt>
          <dd class="tabular min-w-0 truncate text-body text-graphite">
            {{ room.selfId || '未连接' }}
          </dd>
        </div>
        <div class="hair-b flex items-baseline justify-between gap-3 px-3 py-2">
          <dt class="label-cn shrink-0 text-pencil">房间状态</dt>
          <dd class="text-body text-graphite">
            {{
              room.phase === 'joined' ? `${room.code} · ${room.peerCount} 个对等端` : '未在房间中'
            }}
          </dd>
        </div>
        <div
          v-for="relay in room.relays"
          :key="relay.url"
          class="hair-b flex items-baseline justify-between gap-3 px-3 py-2 last:border-b-0"
        >
          <dt class="min-w-0 truncate text-body text-graphite">
            {{ relay.url.replace(/^wss:\/\//, '') }}
          </dt>
          <dd class="label-cn flex shrink-0 items-center gap-1.5 text-graphite">
            <!-- 与房间页同一套记号：实心＝已连、空心＝连接中、划掉＝失败 -->
            <svg viewBox="0 0 8 8" class="h-2 w-2" aria-hidden="true">
              <circle
                cx="4"
                cy="4"
                r="3"
                :fill="relay.state === 'open' ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.2"
              />
              <line
                v-if="relay.state !== 'open' && relay.state !== 'connecting'"
                x1="1.5"
                y1="6.5"
                x2="6.5"
                y2="1.5"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
            {{ relayText(relay.state) }}
          </dd>
        </div>
      </dl>

      <p v-if="room.relays.length === 0" class="hair-t px-3 py-3 text-body text-pencil">
        进入房间后这里会列出每个中继的连接情况。
      </p>

      <div v-if="room.phase === 'joined'" class="hair-t p-3">
        <PadButton variant="outline" @click="rebroadcast">重新广播我的一栏</PadButton>
      </div>
    </section>

    <div class="flex-1"></div>
  </main>
</template>
