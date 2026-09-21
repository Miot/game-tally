<script setup lang="ts">
/**
 * 《月球殖民地》房间背景。
 * 取材自封面与玩家垫板：环形山地形、玻璃穹顶城市、着陆平台、复古未来主义机器人、天上的地球。
 *
 * 构图要点：房间页被计分卡片占满，真正露出背景的只有顶部一条，
 * 因此月球天际线压在画面上方，地平线以下留作大片月壤，让卡片像摆在月面上。
 */

/** 地面陨石坑：cx/cy 为圆心，r 为半径，t 控制阴影浓淡 */
const craters: ReadonlyArray<{ cx: number; cy: number; r: number; t: number }> = [
  { cx: 54, cy: 222, r: 38, t: 0.38 },
  { cx: 232, cy: 206, r: 24, t: 0.26 },
  { cx: 376, cy: 244, r: 32, t: 0.32 },
  { cx: 132, cy: 300, r: 22, t: 0.22 },
  { cx: 322, cy: 344, r: 36, t: 0.24 },
  { cx: 58, cy: 400, r: 26, t: 0.18 },
]

const stars: ReadonlyArray<{ x: number; y: number; r: number }> = [
  { x: 40, y: 48, r: 1.8 },
  { x: 118, y: 96, r: 1.3 },
  { x: 188, y: 38, r: 1.5 },
  { x: 262, y: 118, r: 1.2 },
  { x: 86, y: 132, r: 1.3 },
  { x: 24, y: 106, r: 1.1 },
  { x: 410, y: 132, r: 1.3 },
  { x: 306, y: 62, r: 1.2 },
]
</script>

<template>
  <svg
    class="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    viewBox="0 0 430 900"
    preserveAspectRatio="xMidYMin slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="mb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eef3fa" />
        <stop offset="1" stop-color="#dde5f0" />
      </linearGradient>
      <linearGradient id="mb-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e4e0d9" />
        <stop offset="0.35" stop-color="#eceae5" />
        <stop offset="1" stop-color="#f4f2ef" />
      </linearGradient>
      <linearGradient id="mb-ridge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#cdd4e0" />
        <stop offset="1" stop-color="#b7bfcd" />
      </linearGradient>
      <radialGradient id="mb-earth" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stop-color="#d4ecff" />
        <stop offset="0.55" stop-color="#8ec9ee" />
        <stop offset="1" stop-color="#4b93c9" />
      </radialGradient>
      <radialGradient id="mb-dome" cx="0.35" cy="0.2" r="0.85">
        <stop offset="0" stop-color="#a5f3fc" stop-opacity="0.6" />
        <stop offset="1" stop-color="#22d3ee" stop-opacity="0.22" />
      </radialGradient>
      <radialGradient id="mb-crater" cx="0.42" cy="0.36" r="0.62">
        <stop offset="0" stop-color="#cfc9c0" />
        <stop offset="0.82" stop-color="#e6e2dc" />
        <stop offset="1" stop-color="#efece8" />
      </radialGradient>
    </defs>

    <rect width="430" height="900" fill="url(#mb-sky)" />

    <!-- 星空与地球 -->
    <g fill="#64748b" opacity="0.3">
      <circle v-for="(star, i) in stars" :key="i" :cx="star.x" :cy="star.y" :r="star.r" />
    </g>
    <g opacity="0.42">
      <circle cx="366" cy="72" r="31" fill="url(#mb-earth)" />
      <path
        d="M342 58c13 6 27 5 40-3M338 80c15 8 33 7 48-2M348 98c9 4 20 4 29-1"
        fill="none"
        stroke="#ffffff"
        stroke-width="3.2"
        stroke-linecap="round"
        opacity="0.6"
      />
    </g>

    <!-- 远景环形山坑壁 -->
    <path
      d="M0 146 L40 118 L72 132 L112 100 L154 128 L192 110 L232 134 L270 114 L318 138 L358 120 L430 144 L430 190 L0 190 Z"
      fill="url(#mb-ridge)"
      opacity="0.42"
    />

    <!-- 殖民地天际线：通信塔、玻璃穹顶城市、着陆平台与机器人。
         横向落在 x 130–370，避开左侧昵称与右侧撤销按钮之间的空白。 -->
    <g opacity="0.5">
      <!-- 通信塔 -->
      <path d="M138 172 L146 116 L154 172 Z" fill="#94a0b1" />
      <path d="M141 146h11" stroke="#94a0b1" stroke-width="2.4" />
      <circle cx="146" cy="111" r="4.2" fill="#0891b2" opacity="0.75" />

      <!-- 玻璃穹顶与内部建筑 -->
      <path d="M159 172a46 46 0 0 1 92 0z" fill="url(#mb-dome)" />
      <path
        d="M159 172a46 46 0 0 1 92 0"
        fill="none"
        stroke="#0e7490"
        stroke-width="2.4"
        opacity="0.5"
      />
      <path
        d="M205 126v46M176 142h58M168 158h74"
        stroke="#0e7490"
        stroke-width="1.3"
        opacity="0.28"
      />
      <g fill="#8b95a5">
        <rect x="176" y="152" width="12" height="20" rx="2.5" />
        <rect x="193" y="138" width="14" height="34" rx="2.5" />
        <rect x="212" y="146" width="10" height="26" rx="2.5" />
        <rect x="228" y="156" width="13" height="16" rx="2.5" />
      </g>
      <circle cx="200" cy="133" r="3.2" fill="#f59e0b" opacity="0.9" />

      <!-- 连接管道与着陆平台 -->
      <path d="M251 167h16" stroke="#94a0b1" stroke-width="5.5" stroke-linecap="round" />
      <path d="M255 172a25 10 0 1 1 50 0z" fill="#94a0b1" />
      <path d="M268 148 L280 122 L292 148 Z" fill="#aeb6c2" />
      <rect x="277" y="117" width="6" height="12" rx="3" fill="#ef4444" opacity="0.7" />

      <!-- 复古未来主义机器人 -->
      <g>
        <rect
          x="310"
          y="142"
          width="30"
          height="30"
          rx="11"
          fill="#5eead4"
          stroke="#0f766e"
          stroke-width="1.8"
        />
        <rect x="316" y="150" width="18" height="11" rx="5.5" fill="#0f766e" opacity="0.7" />
        <circle cx="321" cy="155" r="2.3" fill="#ccfbf1" />
        <circle cx="329" cy="155" r="2.3" fill="#ccfbf1" />
        <path d="M325 142v-8" stroke="#0f766e" stroke-width="2" stroke-linecap="round" />
        <circle cx="325" cy="131" r="3.2" fill="#f59e0b" />
        <rect
          x="302"
          y="149"
          width="6"
          height="15"
          rx="3"
          fill="#5eead4"
          stroke="#0f766e"
          stroke-width="1.5"
        />
        <rect
          x="342"
          y="149"
          width="6"
          height="15"
          rx="3"
          fill="#5eead4"
          stroke="#0f766e"
          stroke-width="1.5"
        />
      </g>

      <!-- 地平线上的基座 -->
      <rect x="132" y="170" width="180" height="4.5" rx="2.25" fill="#7d8695" />
    </g>

    <!-- 月壤地面与陨石坑 -->
    <path
      d="M0 174 C 90 166, 150 182, 226 176 S 358 164, 430 176 L430 900 L0 900 Z"
      fill="url(#mb-ground)"
    />
    <g>
      <ellipse
        v-for="(crater, i) in craters"
        :key="i"
        :cx="crater.cx"
        :cy="crater.cy"
        :rx="crater.r"
        :ry="crater.r * 0.36"
        fill="url(#mb-crater)"
        :opacity="crater.t"
      />
      <ellipse
        v-for="(crater, i) in craters"
        :key="`rim-${i}`"
        :cx="crater.cx"
        :cy="crater.cy - crater.r * 0.07"
        :rx="crater.r"
        :ry="crater.r * 0.36"
        fill="none"
        stroke="#ffffff"
        stroke-width="2.2"
        :opacity="crater.t * 0.8"
      />
    </g>
  </svg>
</template>
