<script setup lang="ts">
/**
 * 月面背景：浅色天空、远处淡蓝地球、灰白月壤地平线与陨石坑。
 * 固定铺满视口、不响应指针，透明度压低以保证卡片可读。
 */
const craters: ReadonlyArray<{ cx: number; cy: number; rx: number; ry: number }> = [
  { cx: 120, cy: 700, rx: 70, ry: 26 },
  { cx: 330, cy: 760, rx: 48, ry: 18 },
  { cx: 560, cy: 690, rx: 90, ry: 32 },
  { cx: 760, cy: 780, rx: 40, ry: 15 },
  { cx: 900, cy: 720, rx: 64, ry: 24 },
  { cx: 240, cy: 850, rx: 30, ry: 11 },
  { cx: 680, cy: 860, rx: 54, ry: 20 },
]
</script>

<template>
  <svg
    class="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="moon-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f5f7fb" />
        <stop offset="1" stop-color="#e6ecf5" />
      </linearGradient>
      <linearGradient id="moon-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e3e8ef" />
        <stop offset="1" stop-color="#c9d1dc" />
      </linearGradient>
      <radialGradient id="moon-earth" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#bfe3ff" />
        <stop offset="0.6" stop-color="#7cc4f0" />
        <stop offset="1" stop-color="#3b8fd0" />
      </radialGradient>
      <radialGradient id="moon-crater" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#b9c2cf" />
        <stop offset="0.75" stop-color="#cdd5e0" />
        <stop offset="1" stop-color="#eef2f8" />
      </radialGradient>
    </defs>

    <rect width="1000" height="1000" fill="url(#moon-sky)" />
    <g fill="#0b1220" opacity="0.12">
      <circle cx="80" cy="90" r="1.6" />
      <circle cx="210" cy="40" r="1.2" />
      <circle cx="420" cy="120" r="1.8" />
      <circle cx="640" cy="60" r="1.3" />
      <circle cx="900" cy="150" r="1.5" />
      <circle cx="760" cy="230" r="1.1" />
      <circle cx="300" cy="250" r="1.4" />
    </g>
    <circle cx="700" cy="170" r="70" fill="url(#moon-earth)" opacity="0.45" />
    <path
      d="M650 150c20-18 50-10 70 6 14-22 40-16 52 2"
      stroke="#ffffff"
      stroke-width="8"
      stroke-linecap="round"
      fill="none"
      opacity="0.5"
    />

    <path
      d="M0 640 C 180 600, 320 660, 500 630 S 820 590, 1000 640 L1000 1000 L0 1000 Z"
      fill="url(#moon-ground)"
      opacity="0.9"
    />
    <g>
      <ellipse
        v-for="(crater, index) in craters"
        :key="index"
        :cx="crater.cx"
        :cy="crater.cy"
        :rx="crater.rx"
        :ry="crater.ry"
        fill="url(#moon-crater)"
        stroke="#f6f8fb"
        stroke-width="2"
        opacity="0.8"
      />
    </g>
  </svg>
</template>
