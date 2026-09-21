# 《局分》GameTally · 第一版方案（产品 + 技术）

- 版本：v1 草案
- 日期：2026-09-20
- 状态：已决策，进入实施（2026-09-20 用户拍板，见第 1 节）
- 仓库：github.com/Miot/game-tally → 上线地址预计 `https://miot.github.io/game-tally/`

## 0. 一句话定义

同桌玩家各自用手机打开一个静态网页，创建或加入房间后，手动增减自己的 token 数量，所有人实时看到彼此的分数。没有后端，托管在 GitHub Pages。第一版只内置《月球殖民地》（Moon Colony Bloodbath）。

## 1. 决策结果（2026-09-20 用户拍板）

| # | 决策点 | 结论 |
|---|--------|------|
| D1 | 房间同步方案 | **Trystero**。玩家可切换查看其他玩家的分数，但只读，不能修改 |
| D2 | 计分范围 | 《月球殖民地》只记三项：**幸存者、钱、食物**，用对应的 token 样式展示，配移动端友好的加减按钮 |
| D3 | UI 组件层 | Vant 4 + Tailwind CSS 4（按推荐执行） |
| D4 | 加入房间方式 | 4 位房间码 + 分享链接 + 二维码（按推荐执行） |
| D5 | 网络环境 | **需要在中国大陆使用**：默认 MQTT 信令策略，STUN 使用大陆可达节点，允许自定义 TURN |
| D6 | 单机模式 | **不做**「一部手机记全桌」 |
| D7 | PWA | 做（按推荐执行） |
| D8 | 封面与美术 | 不内嵌 BGG/出版社图片，自绘 SVG（按推荐执行） |
| D9 | 状态模型 | 每人只写自己的状态 + 版本号，入房推送快照，不引入 CRDT（按推荐执行） |

对第 2、3 节的修正：2.2 的「垫板人口 + 建筑人口」合并为单一「幸存者」计数器；2.3 第 6 条单机模式删除；快捷行动缩减为与三项计数器相关的采矿 +4 钱、耕作 +4 食物；事件流简化为每位玩家卡片上的「最近变动」。

## 2. 产品方案

### 2.1 使用场景

- 4 个人围桌玩《月球殖民地》，桌上 token 频繁增减、互相看不清对方还剩多少人。
- 一人创建房间把二维码亮出来，其他人扫码进入，各自在手机上记自己的殖民地。
- 任何人抬头一看手机就知道全桌排名，游戏结束时直接出结算。

### 2.2 第一版游戏：《月球殖民地》Moon Colony Bloodbath

来源：BGG #425549、riograndegames.com、rulespal.com 规则书、geekdad.com 评测（链接见第 6 节）。

| 项目 | 内容 |
|------|------|
| 设计 / 美术 | Donald X. Vaccarino / Franz Vohwinkel |
| 出版 | Rio Grande Games，2025（另有 alea、Hobby Japan 等版本） |
| 人数 / 时长 / 年龄 | 1–5 人 / 45–90 分钟 / 14+ |
| 机制 | Tableau 建造、同时行动选择、事件、牌库构筑 |
| 主题 | 1950s 复古未来主义月面殖民 + 黑色幽默的生存 |
| token | 人口 75、钱 60、食物 50、箱子 40 |
| 起始 | 每人 30 人、4 钱、4 食物 |
| 工作行动 | Restock +2 箱子；Build 付钱建造；Mine +4 钱；Farm +4 食物；Research 抽 2 卡 |
| 扣人规则 | 先扣垫板人口，不够则失去一栋建筑 |
| 结束 | 某人殖民地无人，或到达 Instruction Manual 事件 |
| 胜者 | 垫板人口 + 建筑印刷人口 之和最多；无分数轨、无并列规则 |

映射到计分模型：

- 必记计数器：`垫板人口`、`建筑人口`；派生值 `幸存者 = 两者之和`，作为排行依据。
- 可选计数器（开关）：`钱`、`食物`、`箱子`。
- 快捷行动：采矿 +4 钱、耕作 +4 食物、补货 +2 箱、建造（输入花费）、事件扣人（饥荒 / 泄漏 / 事故 / 故障 / 文书 / 断电，记录原因与人数）。
- 殖民地覆灭：幸存者归零时标记「殖民地失败」，房间内广播游戏结束提示。

### 2.3 功能范围（v1，全部做完整）

1. 首页：选择游戏（v1 仅一款，但列表结构预留）、创建房间、输入房间码加入、打开分享链接自动加入、单机模式。
2. 房间页：
   - 顶栏：房间码、二维码按钮、在线人数、连接状态灯。
   - 我的殖民地卡：昵称与机器人头像、大号幸存者数字、各计数器的 +1 / −1 / +5 / −5、快捷行动栏。
   - 其他玩家卡：只读、实时刷新，离线者灰显并保留最后数据。
   - 排行：按幸存者排序，并列同名次。
   - 事件流：谁、何时、因何事件、损失多少人；本人可撤销自己最近一条。
3. 撤销 / 重做：仅对本人操作。
4. 断线重连与刷新恢复：本地持久化自己与他人的最后状态，重新入房后拉快照。
5. 结算页：排名、幸存者、总死亡数、最惨事件；导出为可分享的长图。
6. 单机模式：一部手机记全桌，玩家以标签页切换，同一套计数器组件。
7. PWA：可安装、离线可用（单机模式全离线）。

### 2.4 明确不做（v1）

账号体系、云端战绩、多游戏内容、内置扫码器、多语言、自动裁判规则、语音视频。

### 2.5 UI 方向

- 主题：「月面基地任务控制台」。深空蓝黑底、月尘灰面板、琥珀色警告、青色科技高光；圆形舷窗与穹顶建筑轮廓做装饰；机器人头像作为玩家标识。
- 字体：数字用几何等宽显示字体（自托管，避免外链），中文用系统字体。
- 计数器：LED 读数风格；扣人时红色闪烁 + 骷髅计数 + 轻微震动（`navigator.vibrate`）；加钱加粮有短动效。
- 移动端规范：触控目标不小于 44px、单手拇指可达（主要操作在下半屏）、深色为默认、支持横竖屏、安全区适配。
- 版权：不使用 BGG 与出版社的封面与卡图，游戏信息页只放文字与 BGG 链接。

## 3. 技术方案

### 3.1 架构总览

```
手机 A ─┐                       ┌─ 手机 B
        │  WebRTC DataChannel   │
        ├───────────────────────┤     所有对等端两两直连（mesh，≤5 人）
        │                       │
手机 C ─┘                       └─ 手机 D
   ▲                                  ▲
   │ 信令（仅交换连接描述，不经手业务数据）
   └───── 公共 Nostr 中继 / MQTT broker（Trystero 内置默认列表）─────┘

静态资源：GitHub Pages（Vite 构建产物）
本地持久化：localStorage（自己的状态、他人最后快照、房间码、玩家 ID）
```

- 没有任何自建服务；信令走公共中继，业务数据端到端加密直连。
- 传输层抽象为接口 `RoomTransport`，Trystero 只是其中一个实现，测试用内存实现，未来可换 Supabase 等。

### 3.2 技术栈（版本为 2026-09-20 npm 实测）

| 层 | 选型 | 版本 | 说明 |
|----|------|------|------|
| 框架 | Vue 3 + TypeScript | 3.5.43 | `<script setup>`，Composition API |
| 构建 | Vite | 8.3.0 | `base: '/game-tally/'` |
| 状态 | Pinia | 4.0.3 | `room` / `players` / `settings` 三个 store |
| 路由 | Vue Router | 5.3.1 | hash 模式，GitHub Pages 不需要 404 回退 |
| 工具 | @vueuse/core | 15.0.0 | `useStorage`、`useNetwork`、`useWakeLock` |
| P2P | trystero | 0.25.4 | 默认 Nostr，备用 `@trystero-p2p/mqtt` |
| UI | Vant 4 + Tailwind CSS 4 | 最新 | 见 D3 |
| PWA | vite-plugin-pwa | 1.3.0 | manifest + service worker |
| 二维码 | qrcode | 1.5.4 | 生成房间链接二维码 |
| 测试 | Vitest + @vue/test-utils + Playwright | 最新 | 见 3.8 |
| 规范 | ESLint（flat config）+ Prettier | 最新 | 提交前 lint-staged |
| 包管理 | pnpm | 10.33.0（本机） | node 20.20.2（本机） |

### 3.3 房间同步：候选对比

| 方案 | 是否需要后端 | 成熟度 | 手机网络可靠性 | 迟到加入 / 刷新恢复 | 中国大陆可用性 | 结论 |
|------|-------------|--------|----------------|---------------------|----------------|------|
| A. Trystero（WebRTC + 公共中继信令） | 否 | 高：2.8k star，0.25.4，2026-08 更新，MIT | 中：同 Wi-Fi 直连极稳；跨运营商可能需 TURN | 靠对等端互发快照；全员离线则丢 | 中：Nostr 中继多被墙，MQTT 可选 EMQX 公共 broker；STUN 需换国内地址 | **推荐** |
| B. webConnect.js | 否 | 低：24 star，0.0.12，2025-11 更新，915KB | 同 A | 同 A | 同 A | 与 A 同类，生态与体积都不如 A |
| C. Supabase Realtime 免费层 | 无需自写，但依赖托管服务 | 高 | 高：走 WebSocket，无 NAT 问题 | 好：可把房间状态落库 | 中：AWS 节点可达但不稳 | 免费项目 7 天不活跃会暂停；需要前端暴露 anon key；违背「无后端」的初衷，作为 B 计划 |
| D. Firebase RTDB 免费层 | 同 C | 高 | 高 | 好 | 差：大陆基本不可用 | 不推荐 |
| E. 单机模式（一部手机） | 否 | — | 完全不依赖网络 | 天然 | 天然 | **作为兜底必做** |

推荐组合：A + E。Trystero 房间配置要点：

```ts
import { joinRoom } from 'trystero'            // Nostr
// 备用：import { joinRoom } from '@trystero-p2p/mqtt'
const room = joinRoom(
  {
    appId: 'gametally',
    rtcConfig: { iceServers: [{ urls: ['stun:stun.miwifi.com', 'stun:stun.l.google.com:19302'] }] },
    // 可选：turnConfig: [{ urls: ['turn:…'], username, credential }]
  },
  `mcb-${roomCode}`,
)
```

- 房间码：4 位，去掉 0/O/1/I 等易混字符，约 100 万种组合，`appId + roomId` 即命名空间。
- 连接策略在设置里可切换（Nostr / MQTT），并提供「连接诊断」页显示中继与对等端状态。
- 若 D5 确认常在大陆使用：默认改为 MQTT 策略 + 国内 STUN；并评估接入一个免费 TURN（例如 metered.ca Open Relay 免费额度）。

### 3.4 状态模型

```ts
interface PlayerState {
  playerId: string        // localStorage 里的稳定 UUID，跨会话不变
  name: string
  avatar: string          // 机器人头像 id
  counters: Record<CounterId, number>
  failed: boolean         // 殖民地覆灭
  version: number         // 每次本人修改 +1，接收方只接受更大的版本
  updatedAt: number
}

interface LogEntry {
  id: string              // `${playerId}-${seq}`
  playerId: string
  ts: number
  kind: 'action' | 'event'
  label: string           // 例如「泄漏 −3 人」
  delta: Partial<Record<CounterId, number>>
}
```

- 每个对等端只写自己的 `PlayerState`，广播给全员；接收方按 `version` 取大者。天然无冲突，不需要 CRDT。
- 事件流按 `(ts, playerId, seq)` 合并去重，追加写。
- 新人入房：对所有对等端发 `snapshot` 请求（Trystero 的 request/response action），合并回复。
- 本地缓存所有人的最后快照，刷新页面立即可见，重连后再更新。
- Trystero 的 `selfId` 每次会话都变，业务上用 `playerId` 识别人，允许换手机继续同一殖民地（输入同一房间码 + 选择接管）。

### 3.5 数据驱动的游戏定义

新增游戏只需新增一个定义文件，不改 UI 代码：

```ts
export interface GameDefinition {
  id: 'moon-colony-bloodbath'
  name: { zh: '月球殖民地'; en: 'Moon Colony Bloodbath' }
  bggId: 425549
  players: { min: 1; max: 5 }
  counters: CounterDefinition[]        // id、名称、图标、初始值、最小值、步进、是否可选
  derived: DerivedDefinition[]         // 幸存者 = 垫板人口 + 建筑人口
  quickActions: QuickActionDefinition[]// 采矿 +4 钱 等
  events: EventDefinition[]            // 饥荒 / 泄漏 … 用于事件流的原因选择
  ranking: { by: 'survivors'; order: 'desc' }
  endCondition: { counter: 'survivors'; equals: 0 }
  theme: ThemeTokens                   // 配色、头像集
}
```

### 3.6 目录结构

```
game-tally/
├─ .github/workflows/deploy.yml   # 构建 + 部署到 GitHub Pages
├─ docs/plan-v1.md
├─ public/                        # 图标、manifest 资源
├─ src/
│  ├─ main.ts / App.vue / router.ts
│  ├─ games/                      # 游戏定义（数据）
│  │  ├─ types.ts
│  │  ├─ moon-colony-bloodbath.ts
│  │  └─ index.ts
│  ├─ sync/                       # 传输层
│  │  ├─ transport.ts             # RoomTransport 接口
│  │  ├─ trystero-transport.ts
│  │  └─ memory-transport.ts      # 测试与单机模式
│  ├─ stores/                     # pinia：room、players、settings
│  ├─ components/                 # Counter、PlayerCard、RankList、EventFeed、RoomBar、QrSheet
│  ├─ views/                      # HomeView、RoomView、SoloView、ResultView
│  ├─ theme/                      # tokens.css、fonts
│  └─ utils/                      # roomCode、id、storage
├─ tests/e2e/                     # Playwright
└─ *.spec.ts 与源码同目录         # Vitest
```

### 3.7 部署（GitHub Pages）

- 仓库 Settings → Pages → Source 选 GitHub Actions。
- `deploy.yml`：push 到 `main` 触发，pnpm install → lint → test → build → `actions/upload-pages-artifact` → `actions/deploy-pages`。
- Vite `base` 设为 `/game-tally/`；路由 hash 模式，分享链接形如 `https://miot.github.io/game-tally/#/r/K7PQ`。
- PWA 的 service worker 作用域同样在 `/game-tally/` 下。

### 3.8 测试与质量

| 层 | 工具 | 覆盖 |
|----|------|------|
| 单元 | Vitest | 游戏定义校验、派生值、版本合并、事件流去重、房间码生成 |
| 组件 | Vitest + @vue/test-utils | 计数器边界（不低于 0、步进）、撤销重做 |
| 集成 | Vitest + memory-transport | 两个 store 实例通过内存传输互发快照、迟到加入、离线重连 |
| 端到端 | Playwright（iPhone 视口） | 单机模式完整一局；两个浏览器上下文通过真实 Trystero 入同一房间并互见分数（标记为可跳过的网络用例） |
| 真机冒烟 | 手工脚本 | 两部手机：同 Wi-Fi、各自蜂窝网络、一方切后台再回来 |

### 3.9 性能与体积预算

- 首屏 JS 压缩后 < 200KB（Vue 约 35KB、Pinia 约 5KB、Trystero 42KB、Vant 按需引入）。
- 状态广播节流 100ms，连续点击合并为一次发送。
- 5 人 mesh 每人维护 4 条连接，数据量每次 < 1KB，手机端无压力。
- 计数动画只用 transform / opacity，避免布局抖动。

## 4. 里程碑

| 阶段 | 内容 | 验收 | 预估 |
|------|------|------|------|
| M0 脚手架 | Vite + Vue + TS + Pinia + Router + Vant + Tailwind + PWA + ESLint/Prettier + Vitest + deploy.yml | 空页面上线到 GitHub Pages | 0.5 天 |
| M1 单机计分 | 游戏定义、计数器、快捷行动、事件流、撤销、持久化、结算页 | 一部手机记完一局，刷新不丢 | 1.5 天 |
| M2 房间同步 | RoomTransport、Trystero 实现、房间码/链接/二维码、快照、重连、连接诊断 | 两部手机互见分数，断网重连恢复 | 2 天 |
| M3 主题打磨 | 视觉、动效、震动、横竖屏、安全区、图标、安装提示 | 设计走查通过 | 1.5 天 |
| M4 测试发布 | 单元 / 集成 / E2E、真机冒烟、README、验证报告 | 全部通过，v1.0.0 tag | 1 天 |

## 5. 风险清单

| 风险 | 影响 | 缓解 |
|------|------|------|
| 跨运营商蜂窝网络 WebRTC 打洞失败 | 无法同步 | 提供 TURN 配置入口；单机模式兜底；同 Wi-Fi 提示 |
| 公共中继在大陆不可达 | 无法入房 | MQTT 策略 + 国内 STUN；连接诊断页；可切换策略 |
| 公共中继无 SLA | 偶发入房慢 | 多中继冗余（Trystero `redundancy`）；超时提示重试 |
| 手机切后台断连 | 状态过期 | 回前台自动重连 + 快照请求；离线者灰显并显示最后更新时间 |
| 全员刷新导致房间状态全丢 | 需重新输入 | 每人本地持久化自己与他人快照 |
| GitHub Pages 访问慢 | 首屏慢 | PWA 缓存；首屏体积预算 |

## 6. 参考资料

- BGG 条目：https://boardgamegeek.com/boardgame/425549/moon-colony-bloodbath
- Rio Grande Games 官方页：https://www.riograndegames.com/games/moon-colony-bloodbath/
- 规则书（RulesPal）：https://www.rulespal.com/moon-colony-bloodbath/rulebook
- GeekDad 评测（组件清单）：https://geekdad.com/2025/03/will-you-survive-the-moon-colony-bloodbath/
- Trystero：https://github.com/dmotz/trystero 、https://trystero.dev/docs/
- webConnect.js：https://github.com/nuzulul/webConnect.js
