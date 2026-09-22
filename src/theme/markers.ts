/**
 * 玩家标记：桌游发给每位玩家的那一组同色指示物。
 *
 * 形状与颜色双重编码，任一单独都足以区分玩家 —— 这是桌游出版社的通行做法，
 * 也让色觉差异的玩家不依赖色相就能认出自己那一行。
 * 索引即 Profile.avatar（字段名沿用，避免破坏已存档案与同步协议）。
 */

export type MarkerShape =
  'disc' | 'square' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'cross'

export interface PlayerMarker {
  /** 中文名，用于无障碍标签 */
  name: string
  /** 实心油墨色，均已验证在纸底上承白字不低于 4.5:1 */
  ink: string
  shape: MarkerShape
}

export const PLAYER_MARKERS: readonly PlayerMarker[] = [
  { name: '墨蓝圆盘', ink: '#14538d', shape: 'disc' },
  { name: '朱红方块', ink: '#a6242b', shape: 'square' },
  { name: '森绿三角', ink: '#1f6b45', shape: 'triangle' },
  { name: '赭黄菱形', ink: '#8a5a12', shape: 'diamond' },
  { name: '紫罗兰五边', ink: '#5b3a8e', shape: 'pentagon' },
  { name: '孔雀六边', ink: '#0f6b6b', shape: 'hexagon' },
  { name: '洋红星', ink: '#93286b', shape: 'star' },
  { name: '石板十字', ink: '#3f4a55', shape: 'cross' },
]

export function playerMarker(index: number): PlayerMarker {
  const count = PLAYER_MARKERS.length
  return PLAYER_MARKERS[((index % count) + count) % count]!
}
