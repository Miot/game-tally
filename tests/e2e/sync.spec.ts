import { devices, expect, test } from '@playwright/test'

import { ROOM_CODE_ALPHABET } from '../../src/utils/room-code'

/** 每次随机房间码，避免与同一公共中继上的其他使用者撞房 */
function randomCode(): string {
  return Array.from(
    { length: 4 },
    () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)],
  ).join('')
}

test.describe('真实网络同步', () => {
  test.skip(!process.env.E2E_NETWORK, '需要 E2E_NETWORK=1 且能访问公共 MQTT 中继')

  test('两台设备经公共中继入房，互相看到分数且只读', async ({ browser, baseURL }) => {
    // 公共中继偶发丢公告时 Trystero 每 60 秒重新公告，等待需覆盖一轮
    test.setTimeout(180_000)
    const DISCOVERY_TIMEOUT_MS = 90_000
    const code = randomCode()
    const contextA = await browser.newContext(devices['Pixel 7'])
    const contextB = await browser.newContext(devices['Pixel 7'])
    const a = await contextA.newPage()
    const b = await contextB.newPage()

    await a.goto(`${baseURL}#/r/${code}`)
    await a.getByPlaceholder('你的昵称').fill('阿波罗')
    await a.getByTestId('confirm-profile').click()
    await b.goto(`${baseURL}#/r/${code}`)
    await b.getByPlaceholder('你的昵称').fill('月尘')
    await b.getByTestId('confirm-profile').click()

    const startedAt = Date.now()
    await expect(a.getByTestId('connection-badge')).toHaveText(/1 人在线/, {
      timeout: DISCOVERY_TIMEOUT_MS,
    })
    await expect(b.getByTestId('connection-badge')).toHaveText(/1 人在线/, {
      timeout: DISCOVERY_TIMEOUT_MS,
    })
    console.log(`对等端发现耗时 ${((Date.now() - startedAt) / 1000).toFixed(1)} 秒`)

    await a.getByTestId('counter-survivors-dec-5').click()
    await a.getByTestId('quick-mine').click()

    const chipOfA = b.locator('[data-testid^="chip-"]').filter({ hasText: '阿波罗' })
    await expect(chipOfA).toContainText('25', { timeout: 20_000 })
    await chipOfA.click()
    await expect(b.getByTestId('readonly-banner')).toBeVisible()
    await expect(b.getByTestId('counter-survivors-value')).toHaveText('25')
    await expect(b.getByTestId('counter-money-value')).toHaveText('8')
    await expect(b.getByTestId('counter-survivors-dec-1')).toHaveCount(0)

    await b.getByRole('button', { name: '排行榜' }).click()
    await expect(b.getByRole('list')).toContainText('月尘')

    await contextA.close()
    await expect(b.getByTestId('connection-badge')).toHaveText(/0 人在线/, { timeout: 30_000 })
    await contextB.close()
  })
})
