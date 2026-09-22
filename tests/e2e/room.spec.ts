import { expect, test } from '@playwright/test'

test.describe('房间流程', () => {
  test('创建房间、记分、撤销、刷新恢复、打开邀请', async ({ page }) => {
    await page.goto('./')
    await page.getByTestId('game-moon-colony-bloodbath').click()
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

    // 全桌默认折起，只有一个人时摘要条直说；展开后表里就自己一行
    await expect(page.getByTestId('table-summary')).toContainText('只有你一个人')
    await expect(page.getByTestId(/^chip-/)).toHaveCount(0)
    await page.getByTestId('table-summary').click()
    await expect(page.getByTestId(/^chip-/)).toHaveCount(1)
  })

  test('幸存者归零即出局，整行标记并结束本局', async ({ page }) => {
    await page.goto('./#/r/M4TZ')
    await page.getByPlaceholder('你的昵称').fill('末人')
    await page.getByTestId('confirm-profile').click()

    const survivors = page.getByTestId('counter-survivors-value')
    await expect(survivors).toHaveText('30')
    // 起始 30，减六次 5 恰好归零
    for (let i = 0; i < 6; i += 1) {
      await page.getByTestId('counter-survivors-dec-5').click()
    }
    await expect(survivors).toHaveText('0')

    // 到达下限后不能再减
    await expect(page.getByTestId('counter-survivors-dec-5')).toBeDisabled()
    await expect(page.getByTestId('counter-survivors-dec-1')).toBeDisabled()

    // 折叠状态下摘要条也必须把「本局结束」说出来，不能因为折起就丢掉规则信息
    await expect(page.getByTestId('table-summary')).toContainText('殖民地失败')
    await expect(page.getByTestId('table-summary')).toContainText('本局结束')

    // 展开后那一行标记为出局，写字板给出本局结束的说明
    await page.getByTestId('table-summary').click()
    await expect(page.getByTestId(/^chip-/).first()).toHaveAttribute('aria-label', /殖民地失败/)
    await expect(page.getByText('按规则本局在此结束')).toBeVisible()
  })

  test('首页四格填房间号加入', async ({ page }) => {
    await page.goto('./')

    // 没填满之前不能提交
    await expect(page.getByTestId('join-room')).toBeDisabled()

    await page.getByTestId('room-code-box-0').click()
    await page.keyboard.type('K7PQ')
    // 逐格落位，光标自己往后走
    await expect(page.getByTestId('room-code-box-0')).toHaveValue('K')
    await expect(page.getByTestId('room-code-box-3')).toHaveValue('Q')
    await expect(page.getByTestId('join-room')).toBeEnabled()

    // 退格删最后一位，按钮跟着禁用
    await page.keyboard.press('Backspace')
    await expect(page.getByTestId('room-code-box-3')).toHaveValue('')
    await expect(page.getByTestId('join-room')).toBeDisabled()

    await page.keyboard.type('Q')
    await page.getByTestId('join-room').click()
    await expect(page).toHaveURL(/#\/r\/K7PQ$/)
  })

  test('无效房间码回到首页', async ({ page }) => {
    await page.goto('./#/r/0OI1')
    await expect(page).toHaveURL(/#\/$/)
  })
})
