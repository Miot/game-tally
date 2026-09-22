<script setup lang="ts">
import { PLAYER_MARKERS } from '@/theme/markers'

import PadField from './PadField.vue'
import PlayerMark from './PlayerMark.vue'

/** 开局前领指示物、在计分纸上写下名字，就是这一步。 */
const name = defineModel<string>('name', { required: true })
const avatar = defineModel<number>('avatar', { required: true })

/** 昵称上限，保证计分表一行放得下 */
const NAME_MAX_LENGTH = 12
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <p id="marker-label" class="label-cn mb-2 text-pencil">领一个指示物</p>
      <div class="grid grid-cols-8 gap-1.5" role="radiogroup" aria-labelledby="marker-label">
        <button
          v-for="(marker, index) in PLAYER_MARKERS"
          :key="marker.name"
          type="button"
          role="radio"
          class="tap flex aspect-square items-center justify-center border-2 p-1.5"
          :class="index === avatar ? 'border-graphite bg-paper-2' : 'border-transparent bg-paper'"
          :aria-checked="index === avatar"
          :aria-label="marker.name"
          @click="avatar = index"
        >
          <PlayerMark :index="index" />
        </button>
      </div>
    </div>

    <PadField
      v-model.trim="name"
      label="写下名字"
      placeholder="你的昵称"
      :maxlength="NAME_MAX_LENGTH"
      autocomplete="nickname"
      enterkeyhint="done"
    />
  </div>
</template>
