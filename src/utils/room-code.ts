/**
 * 房间码：4 位大写字母数字，去掉 0/O/1/I 等易混字符，共 32^4 ≈ 105 万种组合。
 */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 4

const ROOM_CODE_PATTERN = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`)
const ILLEGAL_CHARS = new RegExp(`[^${ROOM_CODE_ALPHABET}]`, 'g')

export function generateRoomCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length]).join('')
}

/** 统一用户输入：转大写、剔除字母表之外的字符、截断到固定长度 */
export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(ILLEGAL_CHARS, '').slice(0, ROOM_CODE_LENGTH)
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code)
}
