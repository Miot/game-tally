<script setup lang="ts">
/**
 * 房间页背景：黑色底 + 几团高斯模糊的光晕，取自《月球殖民地》封面的黑色主色。
 * 只做氛围，不含任何可辨认图像，避免干扰浮在上面的交互文字。
 */
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070d]"
    aria-hidden="true"
  >
    <div
      class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl"
    ></div>
    <div class="absolute top-4 -right-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"></div>
    <div class="absolute top-52 -left-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"></div>
    <div class="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
  </div>
</template>
