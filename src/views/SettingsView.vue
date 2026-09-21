<script setup lang="ts">
import { showToast } from 'vant'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ProfileEditor from '@/components/ProfileEditor.vue'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore } from '@/stores/settings'

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

function resetNetwork(): void {
  settings.resetNetwork()
  showToast('已恢复默认网络配置')
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
  <main class="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-3 pb-10">
    <header class="flex items-center gap-2">
      <button
        type="button"
        class="tap flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2"
        aria-label="返回"
        @click="goBack"
      >
        ←
      </button>
      <h1 class="text-lg font-semibold">设置</h1>
    </header>

    <section class="panel p-4">
      <h2 class="mb-3 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">我是谁</h2>
      <ProfileEditor
        v-model:name="settings.profile.name"
        v-model:avatar="settings.profile.avatar"
      />
      <p v-if="room.phase === 'joined'" class="mt-2 text-xs text-ink-3">
        返回房间时会把新昵称同步给同桌。
      </p>
    </section>

    <section class="panel p-4">
      <h2 class="mb-1 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">中继服务器</h2>
      <p class="mb-2 text-xs text-ink-3">
        计分数据经这些公共 MQTT 中继转发，多个并连做冗余。每行一个，下次进入房间生效。
      </p>
      <van-field
        v-model="brokerText"
        type="textarea"
        rows="3"
        autosize
        placeholder="wss://host:port/mqtt"
      />
      <van-button class="mt-3" size="small" plain round @click="resetNetwork">
        恢复默认中继
      </van-button>
    </section>

    <section class="panel p-4">
      <h2 class="mb-2 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">连接诊断</h2>
      <dl class="flex flex-col gap-1 text-xs">
        <div class="flex justify-between gap-2">
          <dt class="text-ink-2">本机对等端 ID</dt>
          <dd class="truncate font-mono text-ink-2">{{ room.selfId || '未连接' }}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="text-ink-2">房间状态</dt>
          <dd class="text-ink-2">
            {{
              room.phase === 'joined' ? `${room.code} · ${room.peerCount} 个对等端` : '未在房间中'
            }}
          </dd>
        </div>
        <div v-for="relay in room.relays" :key="relay.url" class="flex justify-between gap-2">
          <dt class="truncate text-ink-2">{{ relay.url.replace(/^wss:\/\//, '') }}</dt>
          <dd
            :class="
              relay.state === 'open'
                ? 'text-mint-deep'
                : relay.state === 'connecting'
                  ? 'text-amber-deep'
                  : 'text-alert'
            "
          >
            {{ relay.state }}
          </dd>
        </div>
        <p v-if="room.relays.length === 0" class="text-ink-3">进入房间后显示中继连接状态。</p>
      </dl>
      <van-button
        v-if="room.phase === 'joined'"
        class="mt-3"
        size="small"
        plain
        round
        @click="rebroadcast"
      >
        重新广播我的状态
      </van-button>
    </section>
  </main>
</template>
