<script setup lang="ts">
import { showToast } from 'vant'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ProfileEditor from '@/components/ProfileEditor.vue'
import { useRoomStore } from '@/stores/room'
import { useSettingsStore, type SignalingStrategy } from '@/stores/settings'
import { selfId } from '@trystero-p2p/mqtt'

const router = useRouter()
const settings = useSettingsStore()
const room = useRoomStore()

const stunText = computed({
  get: () => settings.network.stunUrls.join('\n'),
  set: (value: string) => {
    settings.network.stunUrls = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  },
})

const strategyOptions: Array<{ value: SignalingStrategy; label: string; hint: string }> = [
  { value: 'mqtt', label: 'MQTT', hint: '推荐，含大陆可达的 broker-cn.emqx.io' },
  { value: 'nostr', label: 'Nostr', hint: '境外中继更多，大陆多数不可达' },
]

function addTurn(): void {
  settings.network.turnServers.push({ urls: '', username: '', credential: '' })
}

function removeTurn(index: number): void {
  settings.network.turnServers.splice(index, 1)
}

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
      <h2 class="mb-1 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">信令策略</h2>
      <p class="mb-3 text-xs text-ink-3">
        只用于让手机之间找到彼此，分数数据不经过中继。下次进入房间生效。
      </p>
      <van-radio-group v-model="settings.network.strategy">
        <van-cell-group inset>
          <van-cell
            v-for="option in strategyOptions"
            :key="option.value"
            :title="option.label"
            :label="option.hint"
            clickable
            @click="settings.network.strategy = option.value"
          >
            <template #right-icon>
              <van-radio :name="option.value" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </section>

    <section class="panel p-4">
      <h2 class="mb-1 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">STUN 服务器</h2>
      <p class="mb-2 text-xs text-ink-3">每行一个，用于穿透运营商 NAT；默认列表大陆优先。</p>
      <van-field
        v-model="stunText"
        type="textarea"
        rows="4"
        autosize
        placeholder="stun:host:port"
      />
    </section>

    <section class="panel p-4">
      <div class="mb-1 flex items-center justify-between">
        <h2 class="font-display text-xs tracking-[0.3em] text-ink-2 uppercase">TURN 中转</h2>
        <button type="button" class="tap text-xs text-accent-deep" @click="addTurn">+ 添加</button>
      </div>
      <p class="mb-2 text-xs text-ink-3">跨运营商蜂窝网络直连失败时才需要。留空则不使用。</p>
      <div
        v-for="(server, index) in settings.network.turnServers"
        :key="index"
        class="mb-2 rounded-xl border border-line p-2"
      >
        <van-field v-model="server.urls" label="地址" placeholder="turn:host:3478" />
        <van-field v-model="server.username" label="用户名" />
        <van-field v-model="server.credential" label="密码" />
        <button type="button" class="tap mt-1 text-xs text-alert" @click="removeTurn(index)">
          删除
        </button>
      </div>
      <van-button size="small" plain round @click="resetNetwork">恢复默认网络配置</van-button>
    </section>

    <section class="panel p-4">
      <h2 class="mb-2 font-display text-xs tracking-[0.3em] text-ink-2 uppercase">连接诊断</h2>
      <dl class="flex flex-col gap-1 text-xs">
        <div class="flex justify-between gap-2">
          <dt class="text-ink-2">本机对等端 ID</dt>
          <dd class="truncate font-mono text-ink-2">{{ selfId }}</dd>
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
