import { describe, expect, it } from 'vitest'

import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from './room-code'

describe('房间码', () => {
  it('生成的房间码长度固定且只含合法字符', () => {
    for (let i = 0; i < 200; i += 1) {
      const code = generateRoomCode()
      expect(code).toHaveLength(ROOM_CODE_LENGTH)
      expect(isValidRoomCode(code)).toBe(true)
      for (const ch of code) expect(ROOM_CODE_ALPHABET).toContain(ch)
    }
  })

  it('校验拒绝易混字符与错误长度', () => {
    expect(isValidRoomCode('AB0C')).toBe(false)
    expect(isValidRoomCode('ABI2')).toBe(false)
    expect(isValidRoomCode('ABC')).toBe(false)
    expect(isValidRoomCode('abcd')).toBe(false)
    expect(isValidRoomCode('K7PQ')).toBe(true)
  })

  it('归一化输入：去空白、转大写、截断、剔除非法字符', () => {
    expect(normalizeRoomCode(' k7pq ')).toBe('K7PQ')
    expect(normalizeRoomCode('k7pqxyz')).toBe('K7PQ')
    expect(normalizeRoomCode('k-7 p_q')).toBe('K7PQ')
  })
})
