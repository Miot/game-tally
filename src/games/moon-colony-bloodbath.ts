import foodIcon from '@/assets/games/moon-colony-bloodbath/food.svg'
import moneyIcon from '@/assets/games/moon-colony-bloodbath/money.svg'
import personIcon from '@/assets/games/moon-colony-bloodbath/person.svg'

import type { GameDefinition } from './types'

/**
 * 《月球殖民地》Moon Colony Bloodbath
 * 资料来源：BGG #425549、Rio Grande Games 官方页、RulesPal 规则书（2026-09-20 查阅）。
 * 封面图直接引用 BGG 图片 CDN（pic8638247），不落库到仓库。
 * token 图标依据 Rio Grande Games 官方规则书 MCB.pdf 第 2 页的指示物重绘为矢量（原图仅 40–65px，放大后模糊）。
 * 胜负只看幸存者数量，因此幸存者为主计数器；钱与食物是游戏中最频繁增减的两种 token。
 */
export const moonColonyBloodbath: GameDefinition = {
  id: 'moon-colony-bloodbath',
  name: { zh: '月球殖民地', en: 'Moon Colony Bloodbath' },
  bggId: 425549,
  bggUrl: 'https://boardgamegeek.com/boardgame/425549/moon-colony-bloodbath',
  designer: 'Donald X. Vaccarino',
  publisher: 'Rio Grande Games',
  year: 2025,
  players: { min: 1, max: 5 },
  playtimeMinutes: { min: 45, max: 90 },
  winCondition: '游戏结束时幸存者最多的玩家获胜；殖民地无人时即出局。',
  cover: {
    src: 'https://cf.geekdo-images.com/KDrRxEKQMmHyM0QQ2ONX4Q__itempage/img/dc_3UTmiIELKRfy83HMVV4jotDk=/fit-in/700x700/filters:strip_icc()/pic8638247.jpg',
    src2x:
      'https://cf.geekdo-images.com/KDrRxEKQMmHyM0QQ2ONX4Q__large/img/UZqhZSdNYcdj8MmlWhNUzvHSci4=/fit-in/1024x1024/filters:no_upscale():strip_icc()/pic8638247.jpg',
    thumb:
      'https://cf.geekdo-images.com/KDrRxEKQMmHyM0QQ2ONX4Q__square200/img/mljgQpJjOAhLBHeMegGCTCJkGcs=/200x200/filters:strip_icc()/pic8638247.jpg',
    alt: 'Moon Colony Bloodbath 桌游封面（来自 BoardGameGeek）',
  },
  counters: [
    {
      id: 'survivors',
      name: '幸存者',
      icon: personIcon,
      color: '#1d4ed8',
      initial: 30,
      min: 0,
      max: 999,
      steps: [1, 5],
      hero: true,
    },
    {
      id: 'money',
      name: '钱',
      icon: moneyIcon,
      color: '#b45309',
      initial: 4,
      min: 0,
      max: 999,
      steps: [1, 5],
    },
    {
      id: 'food',
      name: '食物',
      icon: foodIcon,
      color: '#15803d',
      initial: 4,
      min: 0,
      max: 999,
      steps: [1, 5],
    },
  ],
  quickActions: [
    { id: 'mine', label: '采矿 +4', delta: { money: 4 } },
    { id: 'farm', label: '耕作 +4', delta: { food: 4 } },
  ],
  ranking: { counterId: 'survivors', order: 'desc' },
  elimination: { counterId: 'survivors', atOrBelow: 0, label: '殖民地失败' },
  /* 月面任务记录表：纸偏冷灰，印记取封面的深印刷红 */
  theme: { paper: '#f5f6f4', rule: '#aebfcc', mark: '#b3121f' },
}
