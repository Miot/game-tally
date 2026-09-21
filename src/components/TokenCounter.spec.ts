import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { moonColonyBloodbath } from '@/games/moon-colony-bloodbath'

import TokenCounter from './TokenCounter.vue'

const survivors = moonColonyBloodbath.counters[0]!
const money = moonColonyBloodbath.counters[1]!

describe('TokenCounter', () => {
  it('可编辑时渲染主副加减按钮并发出对应增量', async () => {
    const wrapper = mount(TokenCounter, {
      props: { definition: survivors, value: 30, editable: true },
    })
    expect(wrapper.get('[data-testid="counter-survivors-value"]').text()).toBe('30')
    await wrapper.get('[data-testid="counter-survivors-dec-1"]').trigger('click')
    await wrapper.get('[data-testid="counter-survivors-inc-5"]').trigger('click')
    expect(wrapper.emitted('adjust')).toEqual([[-1], [5]])
  })

  it('只读时不渲染任何按钮', () => {
    const wrapper = mount(TokenCounter, {
      props: { definition: money, value: 4, editable: false },
    })
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.get('[data-testid="counter-money-value"]').text()).toBe('4')
  })

  it('到达下限时禁用减少按钮，到达上限时禁用增加按钮', () => {
    const atMin = mount(TokenCounter, { props: { definition: money, value: 0, editable: true } })
    expect(atMin.get('[data-testid="counter-money-dec-1"]').attributes('disabled')).toBeDefined()
    expect(atMin.get('[data-testid="counter-money-inc-1"]').attributes('disabled')).toBeUndefined()

    const atMax = mount(TokenCounter, {
      props: { definition: money, value: money.max, editable: true },
    })
    expect(atMax.get('[data-testid="counter-money-inc-5"]').attributes('disabled')).toBeDefined()
  })
})
