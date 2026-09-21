import { defineConfig, devices } from '@playwright/test'

const BASE_URL = 'http://localhost:4173/game-tally/'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        launchOptions: {
          // 无头 Chromium 默认用 mDNS 隐藏本机 ICE 候选，同一浏览器内两个上下文
          // 只能靠 STUN 回环直连而时好时坏；关闭后走真实本机地址，双设备用例才稳定
          args: ['--disable-features=WebRtcHideLocalIpsWithMdns'],
        },
      },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
