import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

import { createPlayerId } from '@/utils/id'

/** 玩家身份：playerId 跨会话稳定，用于在房间里识别同一个人 */
export interface Profile {
  playerId: string
  name: string
  /** 机器人头像配色索引，见 theme/avatars.ts */
  avatar: number
}

export interface TurnServer {
  urls: string
  username: string
  credential: string
}

export type SignalingStrategy = 'mqtt' | 'nostr'

export interface NetworkSettings {
  strategy: SignalingStrategy
  stunUrls: string[]
  turnServers: TurnServer[]
}

/**
 * 默认网络配置面向中国大陆：MQTT 信令（含 broker-cn.emqx.io），
 * STUN 优先使用大陆可达节点，境外节点作为补充。
 */
export function defaultNetworkSettings(): NetworkSettings {
  return {
    strategy: 'mqtt',
    stunUrls: [
      'stun:stun.chat.bilibili.com:3478',
      'stun:stun.cdnbye.com:3478',
      'stun:stun.cloudflare.com:3478',
      'stun:stun.l.google.com:19302',
    ],
    turnServers: [],
  }
}

export const PROFILE_STORAGE_KEY = 'gametally:profile'
export const NETWORK_STORAGE_KEY = 'gametally:network'

export const useSettingsStore = defineStore('settings', () => {
  const profile = useStorage<Profile>(
    PROFILE_STORAGE_KEY,
    { playerId: createPlayerId(), name: '', avatar: 0 },
    localStorage,
    { mergeDefaults: true },
  )
  const network = useStorage<NetworkSettings>(
    NETWORK_STORAGE_KEY,
    defaultNetworkSettings(),
    localStorage,
    { mergeDefaults: true },
  )

  const hasName = computed(() => profile.value.name.trim().length > 0)

  function resetNetwork(): void {
    network.value = defaultNetworkSettings()
  }

  return { profile, network, hasName, resetNetwork }
})
