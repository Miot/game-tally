# 局分 GameTally

桌游 token 计分器：同桌玩家各自用手机打开网页，创建或加入房间后手动增减自己的 token，所有人实时看到彼此的分数。没有自建后端，托管在 GitHub Pages，设备之间经公共 MQTT 中继同步。

第一版内置《月球殖民地》（Moon Colony Bloodbath，BGG #425549），记录幸存者、钱、食物三项。

线上地址：https://miot.github.io/game-tally/

## 使用方式

1. 首页选一个指示物、写下名字。
2. 一人点「创建房间」，把二维码或 4 位房间码给同桌。
3. 其他人用相机扫码打开链接，或在首页输入房间码加入。
4. 上半屏是全桌计分表，一眼看完所有人的数；点任意一行查看那个人的一栏（只读，显示为复写黄联）。
5. 下半屏是自己的写字板，只有自己能写。幸存者归零即「殖民地失败」，那一行会被划掉，按规则本局结束。

## 技术栈

Vue 3 · TypeScript · Vite · Pinia · Vue Router（hash 模式）· Tailwind CSS 4 · MQTT.js（公共中继转发）· vite-plugin-pwa。界面控件为自写，不依赖组件库；字体 Archivo Variable 自托管，中文走系统栈。

设计说明与决策记录见 [docs/plan-v1.md](docs/plan-v1.md)。

## 网络说明

- 计分数据经公共 MQTT 中继转发，默认同时连三个做冗余，大陆节点 `broker-cn.emqx.io` 在前。
- 不使用 WebRTC，因此不需要 NAT 穿透，也不需要 STUN/TURN。任意网络组合都能连上，包括一端 Wi-Fi、另一端蜂窝网络。
- 单条状态消息约 260 字节，往返延迟约 400 毫秒。
- 中继列表可在「设置 → 中继服务器」里改；连接状态见「设置 → 连接诊断」。

## 本地开发

```bash
pnpm install
pnpm dev            # 本地开发服务器
pnpm test           # Vitest：多端状态同步
pnpm test:e2e       # Playwright 端到端（首次需 pnpm exec playwright install chromium）
pnpm lint:check     # ESLint
pnpm format:check   # Prettier
pnpm build          # 类型检查 + 构建到 dist/
pnpm generate-pwa-assets   # 由 public/favicon.svg 重新生成 PWA 图标
```

## 真实同步的验证

```bash
E2E_NETWORK=1 pnpm test:e2e tests/e2e/sync.spec.ts
```

该用例开两个浏览器上下文入同一房间，验证互相可见、他人视角只读、离线检测。依赖外部公共中继，因此默认跳过。

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。首次需在仓库 Settings → Pages 把 Source 设为「GitHub Actions」。

## 目录

```
src/
  games/        游戏定义（数据驱动，新增游戏只加文件）
  sync/         传输层接口、Trystero 实现、内存实现（测试用）、消息与合并规则
  stores/       Pinia：settings（身份与网络）、room（房间状态与同步）
  components/   计数器、殖民地面板、玩家切换条、排行榜、二维码、连接状态
  views/        首页、房间页、设置页
  theme/        设计令牌与玩家指示物
tests/e2e/      Playwright
```

## 版权

桌游资料引用自 BoardGameGeek 与 Rio Grande Games 官方页面。游戏封面直接引用 BGG 图片 CDN（不落库到仓库，加载失败退回自绘占位）；token 图标依据出版社官方规则书重绘为矢量，玩家指示物为自绘。
