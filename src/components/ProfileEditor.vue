<script setup lang="ts">
import { AVATAR_PALETTES } from '@/theme/avatars'

import RobotAvatar from './RobotAvatar.vue'

const name = defineModel<string>('name', { required: true })
const avatar = defineModel<number>('avatar', { required: true })

/** 昵称上限，保证切换条与排行榜里不换行 */
const NAME_MAX_LENGTH = 12
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2" role="radiogroup" aria-label="选择头像">
      <button
        v-for="(palette, index) in AVATAR_PALETTES"
        :key="palette.name"
        type="button"
        role="radio"
        class="tap h-10 w-10 rounded-full border-2 p-0.5"
        :class="index === avatar ? 'border-cyan shadow-glow-cyan' : 'border-transparent'"
        :aria-checked="index === avatar"
        :aria-label="`${palette.name}色机器人`"
        @click="avatar = index"
      >
        <RobotAvatar :index="index" />
      </button>
    </div>
    <van-field
      v-model.trim="name"
      placeholder="你的昵称"
      :maxlength="NAME_MAX_LENGTH"
      clearable
      autocomplete="nickname"
      enterkeyhint="done"
      class="rounded-xl"
    />
  </div>
</template>
