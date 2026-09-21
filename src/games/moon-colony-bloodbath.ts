import type { GameDefinition } from './types'

/**
 * 《月球殖民地》Moon Colony Bloodbath
 * 资料来源：BGG #425549、Rio Grande Games 官方页、RulesPal 规则书（2026-09-20 查阅）。
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
  counters: [
    {
      id: 'survivors',
      name: '幸存者',
      token: 'person',
      initial: 30,
      min: 0,
      max: 999,
      steps: [1, 5],
      hero: true,
    },
    {
      id: 'money',
      name: '钱',
      token: 'coin',
      initial: 4,
      min: 0,
      max: 999,
      steps: [1, 5],
    },
    {
      id: 'food',
      name: '食物',
      token: 'food',
      initial: 4,
      min: 0,
      max: 999,
      steps: [1, 5],
    },
  ],
  quickActions: [
    { id: 'mine', label: '采矿 +4 钱', delta: { money: 4 } },
    { id: 'farm', label: '耕作 +4 食物', delta: { food: 4 } },
  ],
  ranking: { counterId: 'survivors', order: 'desc' },
  elimination: { counterId: 'survivors', atOrBelow: 0, label: '殖民地失败' },
}
