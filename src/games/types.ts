/**
 * 游戏定义：描述一款桌游需要记录的 token 与规则要点。
 * 新增游戏只需新增一个定义文件并在 index.ts 注册，UI 不需要改动。
 */

export type CounterId = string

/** 房间背景风格，对应 components/backdrops 注册表 */
export type BackdropId = 'moon'

export interface CounterDefinition {
  id: CounterId
  /** 中文显示名 */
  name: string
  /** token 图片地址：从官方规则书提取的真实 token 图案 */
  icon: string
  /** 读数颜色（十六进制），需在白底上可读 */
  color: string
  /** 每位玩家开局的数量 */
  initial: number
  min: number
  max: number
  /** 加减按钮的步进，第一项为主按钮，其余为副按钮 */
  steps: readonly number[]
  /** 是否为主视觉与排行依据，一款游戏只允许一个 */
  hero?: boolean
}

/** 快捷行动：一次点击对多个计数器施加固定增减，对应游戏中的固定行动 */
export interface QuickActionDefinition {
  id: string
  label: string
  delta: Readonly<Partial<Record<CounterId, number>>>
}

/** 封面图：直接引用 BGG 图片 CDN 的固定尺寸变体，thumb 用于小尺寸场景 */
export interface CoverImage {
  src: string
  src2x: string
  thumb: string
  alt: string
}

export interface EliminationRule {
  counterId: CounterId
  /** 计数器小于等于该值即视为出局 */
  atOrBelow: number
  /** 出局时显示的状态文案 */
  label: string
}

export interface GameDefinition {
  id: string
  name: { zh: string; en: string }
  bggId: number
  bggUrl: string
  designer: string
  publisher: string
  year: number
  players: { min: number; max: number }
  playtimeMinutes: { min: number; max: number }
  /** 一句话说明胜负判定，展示在首页卡片 */
  winCondition: string
  cover: CoverImage
  backdrop: BackdropId
  counters: readonly CounterDefinition[]
  quickActions: readonly QuickActionDefinition[]
  ranking: { counterId: CounterId; order: 'desc' | 'asc' }
  elimination: EliminationRule
}

/** 校验定义的自洽性，在注册时执行，错误直接抛出以便测试与构建期发现 */
export function assertGameDefinition(game: GameDefinition): void {
  const ids = new Set<string>()
  for (const counter of game.counters) {
    if (ids.has(counter.id)) throw new Error(`游戏 ${game.id} 的计数器 id 重复：${counter.id}`)
    ids.add(counter.id)
    if (counter.min > counter.initial || counter.initial > counter.max) {
      throw new Error(`游戏 ${game.id} 的计数器 ${counter.id} 初始值不在范围内`)
    }
    if (counter.steps.length === 0 || counter.steps.some((step) => step <= 0)) {
      throw new Error(`游戏 ${game.id} 的计数器 ${counter.id} 步进必须为正数且至少一项`)
    }
  }
  const heroes = game.counters.filter((counter) => counter.hero)
  if (heroes.length !== 1) throw new Error(`游戏 ${game.id} 必须且只能有一个主计数器`)
  if (!ids.has(game.ranking.counterId)) {
    throw new Error(`游戏 ${game.id} 的排行依据 ${game.ranking.counterId} 不存在`)
  }
  if (!ids.has(game.elimination.counterId)) {
    throw new Error(`游戏 ${game.id} 的出局判定 ${game.elimination.counterId} 不存在`)
  }
  for (const action of game.quickActions) {
    for (const counterId of Object.keys(action.delta)) {
      if (!ids.has(counterId)) {
        throw new Error(`游戏 ${game.id} 的快捷行动 ${action.id} 引用了不存在的计数器 ${counterId}`)
      }
    }
  }
}
