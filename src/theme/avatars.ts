/** 机器人头像配色，索引即 Profile.avatar */
export const AVATAR_PALETTES: ReadonlyArray<{ name: string; body: string; eye: string }> = [
  { name: '青', body: '#38d9f5', eye: '#05080f' },
  { name: '琥珀', body: '#f5a623', eye: '#05080f' },
  { name: '薄荷', body: '#5ee1a0', eye: '#05080f' },
  { name: '玫瑰', body: '#f472b6', eye: '#05080f' },
  { name: '紫', body: '#a78bfa', eye: '#05080f' },
  { name: '月尘', body: '#c9c4b4', eye: '#05080f' },
  { name: '橙', body: '#fb923c', eye: '#05080f' },
  { name: '天蓝', body: '#60a5fa', eye: '#05080f' },
]

export function avatarPalette(index: number) {
  return AVATAR_PALETTES[
    ((index % AVATAR_PALETTES.length) + AVATAR_PALETTES.length) % AVATAR_PALETTES.length
  ]!
}
