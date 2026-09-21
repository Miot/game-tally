import { expect, test } from '@playwright/test'

import { ROOM_CODE_ALPHABET } from '../../src/utils/room-code'

/**
 * 两端经公共 MQTT 中继同步。依赖外部中继，默认跳过，需要时用 E2E_NETWORK=1 运行。
 * 这条链路不做 NAT 穿透，因此与设备所处网络无关。
 */
function randomCode(): string {
  return Array.from(
    { length: 4 },
    () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)],
  ).join('')
}

test.describe('真实中继同步', () => {
  test.skip(!process.env.E2E_NETWORK, '需要 E2E_NETWORK=1 且能访问公共 MQTT 中继')

  test('两端互相看到分数，且他人视角只读', async ({ browser, baseURL }) => {
    test.setTimeout(120_000)
    const code = randomCode()
    const contexts = await Promise.all([browser.newContext(), browser.newContext()])
    const [a, b] = await Promise.all(contexts.map((context) => context.newPage()))

    for (const [page, name] of [
      [a, '阿波罗'],
      [b, '月尘'],
    ] as const) {
      await page.goto(`${baseURL}#/r/${code}`)
      await page.getByPlaceholder('你的昵称').fill(name)
      await page.getByTestId('confirm-profile').click()
      await expect(page.getByTestId('counter-survivors-value')).toBeVisible()
    }

    await expect(a.getByTestId('connection-badge')).toHaveText(/1 人在线/, { timeout: 40_000 })
    await expect(b.getByTestId('connection-badge')).toHaveText(/1 人在线/, { timeout: 40_000 })

    await a.getByTestId('counter-survivors-dec-5').click()
    await a.getByTestId('quick-mine').click()

    const chipOfA = b.locator('[data-testid^="chip-"]').filter({ hasText: '阿波罗' })
    await expect(chipOfA).toContainText('25', { timeout: 20_000 })
    await chipOfA.click()
    await expect(b.getByTestId('readonly-banner')).toBeVisible()
    await expect(b.getByTestId('counter-survivors-value')).toHaveText('25')
    await expect(b.getByTestId('counter-money-value')).toHaveText('8')
    await expect(b.getByTestId('counter-survivors-dec-1')).toHaveCount(0)

    await contexts[0].close()
    await expect(b.getByTestId('connection-badge')).toHaveText(/0 人在线/, { timeout: 40_000 })
    await contexts[1].close()
  })
})
