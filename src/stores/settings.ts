import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

import { DEFAULT_BROKERS } from '@/sync/mqtt-transport'
import { createPlayerId } from '@/utils/id'

/** 玩家身份：playerId 跨会话稳定，用于在房间里识别同一个人 */
export interface Profile {
  playerId: string
  name: string
  /** 机器人头像配色索引，见 theme/avatars.ts */
  avatar: number
}

export interface NetworkSettings {
  /** 计分数据经这些公共 MQTT 中继转发，多个并连做冗余 */
  brokers: string[]
}

export function defaultNetworkSettings(): NetworkSettings {
  return { brokers: [...DEFAULT_BROKERS] }
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
