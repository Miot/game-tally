/** 机器人头像配色，索引即 Profile.avatar；饱和度按白底可读性选取 */
export const AVATAR_PALETTES: ReadonlyArray<{ name: string; body: string; eye: string }> = [
  { name: '青', body: '#0ea5e9', eye: '#ffffff' },
  { name: '琥珀', body: '#f59e0b', eye: '#ffffff' },
  { name: '薄荷', body: '#10b981', eye: '#ffffff' },
  { name: '玫瑰', body: '#ec4899', eye: '#ffffff' },
  { name: '紫', body: '#8b5cf6', eye: '#ffffff' },
  { name: '石墨', body: '#64748b', eye: '#ffffff' },
  { name: '橙', body: '#f97316', eye: '#ffffff' },
  { name: '靛蓝', body: '#4f46e5', eye: '#ffffff' },
]

export function avatarPalette(index: number) {
  return AVATAR_PALETTES[
    ((index % AVATAR_PALETTES.length) + AVATAR_PALETTES.length) % AVATAR_PALETTES.length
  ]!
}
