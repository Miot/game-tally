import type { Component } from 'vue'

import type { BackdropId } from '@/games'

import MoonBackdrop from './MoonBackdrop.vue'

/** 游戏定义里的 backdrop 标识 → 背景组件；新增游戏风格在此注册 */
export const backdrops: Readonly<Record<BackdropId, Component>> = {
  moon: MoonBackdrop,
}
