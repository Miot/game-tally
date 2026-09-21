<script setup lang="ts">
import type { CoverImage } from '@/games'

/**
 * 沉浸式背景：游戏封面完整铺在视口上半部分，向下渐隐到画布色，计分卡片从它上方滑过。
 * 顶部压一层浅遮罩，保证房间码与昵称一行的深色文字仍可读。
 * 任何游戏都可复用，无需为每款游戏单独绘制背景。
 */
defineProps<{ cover: CoverImage }>()
</script>

<template>
  <!-- 高度由封面比例决定（约半屏），保证整张封面满宽完整展示、左右不留白 -->
  <div class="pointer-events-none fixed inset-x-0 top-0 -z-10 overflow-hidden" aria-hidden="true">
    <!--
      高斯模糊柔化封面细节，让浮在上面的房间码与昵称一行保持可读。
      scale 只放大绘制、不改变布局高度，用于裁掉模糊在图片边缘留下的透明带。
    -->
    <img :src="cover.src2x" alt="" class="block w-full scale-105 blur-md" decoding="async" />
    <div
      class="absolute inset-0 bg-linear-to-b from-canvas/55 via-canvas/28 via-55% to-canvas"
    ></div>
  </div>
</template>
