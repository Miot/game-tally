/**
 * 游戏定义：描述一款桌游需要记录的 token 与规则要点。
 * 新增游戏只需新增一个定义文件并在 index.ts 注册，UI 不需要改动。
 */

export type CounterId = string

export interface CounterDefinition {
  id: CounterId
  /** 中文显示名 */
  name: string
  /**
   * token 图片地址：依据官方规则书重绘的 token 图案。
   * 只用作首页封面加载失败时的占位，因此只有主计数器需要，其余可省。
   */
  icon?: string
  /**
   * 资源色（十六进制）：名称块与主步进键的整片底色，也是本资源快捷行动的边框色。
   * 可以是浅色 —— 压在它上面的字由 onColor 负责，读数永远是石墨。
   */
  color: string
  /**
   * 压在资源色上的字色（十六进制）。它只压在 24px 粗体上（名称块、主步进键），
   * 按 WCAG 大字标准与 color 的对比度不低于 3:1；拿去写小字时须提到 4.5:1。
   */
  onColor: string
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

/**
 * 出局：不由计数器推导，由玩家自己点「认输」宣告，任何一人认输即本局结束。
 * 计数器因此可以自由越过零，何时撑不下去由牌桌上的人判断。
 */
export interface EliminationRule {
  /** 出局时显示的状态文案 */
  label: string
}

/**
 * 房间页的换皮接口。
 * 只覆盖纸、格线、印记三色，其余令牌继承外壳，因此新增游戏不必触碰任何组件。
 * 三个值都会作为 CSS 变量写在房间根元素上，Tailwind 的 paper/rule/mark 工具类随之级联。
 */
export interface GameTheme {
  /** 纸色，必须足够浅：使用场景是明亮日光下的桌边 */
  paper: string
  /** 预印发丝格线色 */
  rule: string
  /** 印记色，用于表头条、当前行标记与合计线，需在纸色上不低于 4.5:1 */
  mark: string
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
  counters: readonly CounterDefinition[]
  quickActions: readonly QuickActionDefinition[]
  ranking: { counterId: CounterId; order: 'desc' | 'asc' }
  elimination: EliminationRule
  theme: GameTheme
}
