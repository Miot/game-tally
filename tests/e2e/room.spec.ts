import { expect, test } from '@playwright/test'

test.describe('房间流程', () => {
  test('创建房间、记分、撤销、刷新恢复、打开邀请', async ({ page }) => {
    await page.goto('./')
    await page.getByTestId('create-room').click()
    await expect(page).toHaveURL(/#\/r\/[A-HJ-NP-Z2-9]{4}$/)
    await page.getByPlaceholder('你的昵称').fill('阿波罗')
    await page.getByTestId('confirm-profile').click()

    const survivors = page.getByTestId('counter-survivors-value')
    await expect(survivors).toHaveText('30')
    await page.getByTestId('counter-survivors-dec-1').click()
    await expect(survivors).toHaveText('29')

    const money = page.getByTestId('counter-money-value')
    await page.getByTestId('counter-money-inc-5').click()
    await expect(money).toHaveText('9')
    await page.getByRole('button', { name: '撤销' }).click()
    await expect(money).toHaveText('4')

    await page.getByTestId('quick-farm').click()
    await expect(page.getByTestId('counter-food-value')).toHaveText('8')

    // 计数不会低于下限，到达下限后减少按钮禁用
    await page.getByTestId('counter-money-dec-5').click()
    await expect(money).toHaveText('0')
    await expect(page.getByTestId('counter-money-dec-1')).toBeDisabled()
    await page.getByTestId('quick-mine').click()
    await expect(money).toHaveText('4')

    await page.reload()
    await expect(survivors).toHaveText('29')
    await expect(page.getByTestId('counter-food-value')).toHaveText('8')

    await page.getByRole('button', { name: '更多' }).click()
    await page.getByText('邀请同桌').click()
    await expect(page.getByRole('img', { name: '房间二维码' })).toBeVisible()
    const code = await page.getByTestId('room-code').innerText()
    await expect(page.getByTestId('qr-room-code')).toHaveText(code.trim())

    await page.goto('./')
    await expect(page.getByTestId('resume-room')).toContainText(code.trim())
    await page.getByTestId('resume-room').click()
    await expect(page.getByTestId('room-code')).toHaveText(code.trim())
  })

  test('通过链接进入房间时先起名再进入', async ({ page }) => {
    await page.goto('./#/r/K7PQ')
    await expect(page.getByTestId('confirm-profile')).toBeVisible()
    await page.getByPlaceholder('你的昵称').fill('月尘')
    await page.getByTestId('confirm-profile').click()
    await expect(page.getByTestId('room-code')).toHaveText('K7PQ')
    await expect(page.getByTestId('counter-survivors-value')).toHaveText('30')
    await expect(page.getByTestId(/^chip-/)).toHaveCount(1)
  })

  test('无效房间码回到首页', async ({ page }) => {
    await page.goto('./#/r/0OI1')
    await expect(page).toHaveURL(/#\/$/)
  })
})
