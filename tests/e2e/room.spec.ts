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
    await page.getByTestId('counter-money-inc-4').click()
    await expect(money).toHaveText('8')
    await page.getByRole('button', { name: '撤销' }).click()
    await expect(money).toHaveText('4')

    await page.getByTestId('quick-farm').click()
    await expect(page.getByTestId('counter-food-value')).toHaveText('8')

    // 计数不会低于下限，到达下限后减少按钮禁用
    await page.getByTestId('counter-money-dec-4').click()
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

  test('幸存者可以减到负数，认输才结束本局且可撤回', async ({ page }) => {
    await page.goto('./#/r/M4TZ')
    await page.getByPlaceholder('你的昵称').fill('末人')
    await page.getByTestId('confirm-profile').click()

    const survivors = page.getByTestId('counter-survivors-value')
    const summary = page.getByTestId('table-summary')
    await expect(survivors).toHaveText('30')
    // 起始 30，减八次 4 到 −2：越过零照常记，不会自动出局，也不锁减少键
    for (let i = 0; i < 8; i += 1) {
      await page.getByTestId('counter-survivors-dec-4').click()
    }
    await expect(survivors).toHaveText('-2')
    await expect(page.getByTestId('counter-survivors-dec-1')).toBeEnabled()
    await expect(summary).not.toContainText('殖民地失败')

    // 认输先过一张确认便签，取消则什么都不发生
    const concede = page.getByTestId('concede')
    const dialog = page.getByRole('alertdialog', { name: '认输' })
    await concede.click()
    await dialog.getByRole('button', { name: '取消' }).click()
    await expect(summary).not.toContainText('殖民地失败')

    await concede.click()
    await dialog.getByRole('button', { name: '认输' }).click()

    // 折叠状态下摘要条也必须把「本局结束」说出来，不能因为折起就丢掉规则信息
    await expect(summary).toContainText('殖民地失败')
    await expect(summary).toContainText('本局结束')
    await expect(page.getByText('你已认输')).toBeVisible()

    // 展开后那一行标记为出局
    await summary.click()
    const chip = page.getByTestId(/^chip-/).first()
    await expect(chip).toHaveAttribute('aria-label', /殖民地失败/)

    // 同一位置换成撤回，撤回后回到正常名次
    await expect(concede).toHaveText('撤回认输')
    await concede.click()
    await expect(chip).toHaveAttribute('aria-label', /第 1 名/)
    await expect(page.getByText('你已认输')).toHaveCount(0)
    await expect(concede).toHaveText('认输')
  })

  test('首页四格填房间号加入', async ({ page }) => {
    await page.goto('./')

    // 没填满之前不能提交
    await expect(page.getByTestId('join-room')).toBeDisabled()

    const boxes = [0, 1, 2, 3].map((index) => page.getByTestId(`room-code-box-${index}`))
    const expectBoxes = async (code: string) => {
      for (const [index, box] of boxes.entries()) await expect(box).toHaveText(code[index] ?? '')
    }

    await page.getByTestId('room-code-input').click()
    // 一键只落一格；小写转大写，字母表之外的 o / 0 被剔掉
    await page.keyboard.type('k')
    await expectBoxes('K')
    await page.keyboard.type('7o0pq')
    await expectBoxes('K7PQ')
    await expect(page.getByTestId('join-room')).toBeEnabled()

    // 填满后再敲不进字
    await page.keyboard.type('Z')
    await expectBoxes('K7PQ')

    // 退格删最后一位，按钮跟着禁用
    await page.keyboard.press('Backspace')
    await expectBoxes('K7P')
    await expect(page.getByTestId('join-room')).toBeDisabled()

    // 方向键挪不走插入点，新字仍接在串尾
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.type('Q')
    await expectBoxes('K7PQ')
    await page.getByTestId('join-room').click()
    await expect(page).toHaveURL(/#\/r\/K7PQ$/)
  })

  test('拼音键盘组字时不碰输入框，落定后才清理', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', '组字事件靠 CDP 模拟，只有 Chromium 支持')
    await page.goto('./')
    const input = page.getByTestId('room-code-input')
    const boxes = [0, 1, 2, 3].map((index) => page.getByTestId(`room-code-box-${index}`))
    const expectBoxes = async (code: string) => {
      for (const [index, box] of boxes.entries()) await expect(box).toHaveText(code[index] ?? '')
    }
    const client = await page.context().newCDPSession(page)
    const compose = (text: string) =>
      client.send('Input.imeSetComposition', {
        text,
        selectionStart: text.length,
        selectionEnd: text.length,
      })

    await input.click()
    // iOS 拼音键盘敲字母：字母以组字文字进来，音节之间带空格
    await compose('k')
    await expectBoxes('K')
    await compose('k q')
    await compose('k q p')
    // 三个字母只落三格，输入框保持键盘交来的原样，没有被回写
    await expectBoxes('KQP')
    await expect(input).toHaveValue('k q p')

    // 组字超出四位：格子只取前四位，输入框仍不动
    await compose('k q p r s')
    await expectBoxes('KQPR')
    await expect(input).toHaveValue('k q p r s')
    await expect(page.getByTestId('join-room')).toBeEnabled()

    // 落定后才把空格与超长部分清掉
    await client.send('Input.insertText', { text: 'k q p r s' })
    await expect(input).toHaveValue('KQPR')
    await expectBoxes('KQPR')

    // 清理之后退格一次删一位
    await page.keyboard.press('Backspace')
    await expectBoxes('KQP')
  })

  test('粘贴带分隔符的房间号整串替换', async ({ page }) => {
    await page.goto('./')
    await page.getByTestId('room-code-input').click()
    await page.keyboard.type('AB')

    await page.getByTestId('room-code-input').evaluate((input) => {
      const clipboardData = new DataTransfer()
      clipboardData.setData('text', '房间号 k7-pq，快来')
      input.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
      )
    })

    await expect(page.getByTestId('room-code-input')).toHaveValue('K7PQ')
    await page.getByTestId('join-room').click()
    await expect(page).toHaveURL(/#\/r\/K7PQ$/)
  })

  test('无效房间码回到首页', async ({ page }) => {
    await page.goto('./#/r/0OI1')
    await expect(page).toHaveURL(/#\/$/)
  })
})
