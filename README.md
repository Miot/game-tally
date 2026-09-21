# 局分 GameTally

桌游 token 计分器：同桌玩家各自用手机打开网页，创建或加入房间后手动增减自己的 token，所有人实时看到彼此的分数。没有后端，托管在 GitHub Pages，手机之间通过 WebRTC 直连同步。

第一版内置《月球殖民地》（Moon Colony Bloodbath，BGG #425549），记录幸存者、钱、食物三项。

线上地址：https://miot.github.io/game-tally/

## 使用方式

1. 首页选一个机器人头像、填昵称。
2. 一人点「创建房间」，把二维码或 4 位房间码给同桌。
3. 其他人用相机扫码打开链接，或在首页输入房间码加入。
4. 每个人只能修改自己的计数；点上方的玩家切换条可以查看别人的分数（只读）。
5. 「排行榜」按幸存者排序；幸存者归零即「殖民地失败」，按规则本局结束。

## 技术栈

Vue 3 · TypeScript · Vite · Pinia · Vue Router（hash 模式）· Vant 4 · Tailwind CSS 4 · Trystero（WebRTC + 公共中继信令）· vite-plugin-pwa。

设计说明与决策记录见 [docs/plan-v1.md](docs/plan-v1.md)。

## 网络说明（中国大陆）

- 默认信令策略为 MQTT，中继列表包含 `broker-cn.emqx.io`；分数数据不经过中继，只用于让手机找到彼此。
- 默认 STUN 使用大陆可达节点（bilibili、cdnbye），境外节点作为补充。
- 同一 Wi-Fi 下直连最稳；跨运营商蜂窝网络若无法直连，可在「设置」里填写 TURN 中转服务器。
- 「设置 → 连接诊断」可查看各中继连接状态与对等端数量；房间菜单「重新连接」会重新入房并立即向中继公告。
- token 图标取自 Rio Grande Games 官方规则书（MCB.pdf）中的组件图；房间背景按游戏定制，《月球殖民地》为月面风格。

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

手机之间的 WebRTC 直连不在自动化测试范围内，用两部真机验证：同一 Wi-Fi 下一人创建房间、另一人扫码加入，双方计数应在一秒内互相可见；再让一部切到蜂窝网络重试。连接状态见「设置 → 连接诊断」。

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
  theme/        设计令牌与头像配色
tests/e2e/      Playwright
```

## 版权

桌游资料引用自 BoardGameGeek 与 Rio Grande Games 官方页面；应用内所有图形为自绘，不使用出版社的封面与卡图。
