import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/** 由 public/favicon.svg 生成 PWA 各尺寸图标，输出到 public/ */
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.2, resizeOptions: { background: '#ffffff' } },
    apple: { ...minimal2023Preset.apple, padding: 0.2, resizeOptions: { background: '#ffffff' } },
  },
  images: ['public/favicon.svg'],
})
