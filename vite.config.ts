import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 项目站点的子路径；路由使用 hash 模式，因此无需 404 回退页
const BASE = '/game-tally/'

export default defineConfig({
  base: BASE,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: '局分 GameTally',
        short_name: '局分',
        description: '桌游 token 计分器，同桌玩家互看分数',
        lang: 'zh-CN',
        theme_color: '#f7f7f5',
        background_color: '#f7f7f5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 只引 latin 子集：界面是中文加基本拉丁，latin-ext 与 vietnamese 永远用不到，
      // 但整包导入会让它们进 PWA 预缓存，白占 118KB。
      '@archivo': fileURLToPath(
        new URL('./node_modules/@fontsource-variable/archivo/files', import.meta.url),
      ),
    },
  },
})
