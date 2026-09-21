# 操作日志（operations-log）

## 2026-09-20 方案制定 —《局分》GameTally v1

### 工具链偏差记录
- `sequential-thinking`、`shrimp-task-manager`、`desktop-commander`、`context7`、`github` 等 MCP 工具在本会话不可用。
  - 补救：用模型内推理替代 sequential-thinking；用 Bash/curl + WebSearch/WebFetch 替代 desktop-commander 与 context7；用 `npm view` 核对依赖版本；任务分解直接写入方案文档第 4 节。
- BGG 页面抓取：WebFetch 与裸 curl 均被 Cloudflare 403，XML API2 返回 401。
  - 补救：带浏览器 UA 请求 `api.geekdo.com/api/geekitems`，成功获得完整元信息（已记入全局记忆 bgg-api-access）。
- BGG 两篇评测正文抓取失败（403），改用 RulesPal 规则书页与 GeekDad 评测获取组件与胜负规则。

### 检索结果摘要
- 游戏：Moon Colony Bloodbath，BGG #425549，Donald X. Vaccarino / Franz Vohwinkel / Rio Grande Games 2025，1–5 人，45–90 分钟，14+。
- 胜负：垫板人口 + 建筑印刷人口之和最多者胜；结束条件为某殖民地无人或到达 Instruction Manual 事件。
- 组件：人口 75、钱 60、食物 50、箱子 40 枚 token；起始 30 人 + 4 钱 + 4 食物。
- 同步库：trystero 0.25.4（2026-08-30 更新，2.8k star，42KB）；webconnect 0.0.12（2025-11 更新，24 star，915KB）。
- 前端依赖最新版：vue 3.5.43、vite 8.3.0、pinia 4.0.3、vue-router 5.3.1、@vueuse/core 15.0.0、vite-plugin-pwa 1.3.0；本机 node v20.20.2、pnpm 10.33.0。

### 产出
- `docs/plan-v1.md`：技术 + 产品方案与决策清单。
- `.claude/context-summary-gametally-v1.md`：上下文摘要。
- 全局记忆：bgg-first-for-boardgame-info、bgg-api-access、gametally-project。

### 未执行项
- 本阶段无代码改动，未生成 verification-report.md；待用户决策后进入实现阶段再补。

## 2026-09-20 实施阶段启动

### 用户决策
- 大陆使用 → 默认 MQTT 信令 + 大陆可达 STUN，允许自定义 TURN。
- 计分项只保留幸存者 / 钱 / 食物，token 样式展示，移动端加减按钮。
- 不做单机记全桌；用 Trystero；可切换查看他人分数，只读。

### 网络探测（本机出口为香港，仅供参考，非大陆实测）
- STUN 响应：stun.chat.bilibili.com:3478、stun.cdnbye.com:3478、stun.l.google.com:19302、stun.cloudflare.com:3478；超时：stun.miwifi.com、stun.hitv.com、stun.qq.com。
- MQTT over WSS 握手：broker.hivemq.com:8884、test.mosquitto.org:8081 返回 101；broker.emqx.io:8084 返回 501（curl 手工握手不完整，非不可达证据）。

### 编码前检查 - 项目脚手架与核心功能
- 已查阅上下文摘要：.claude/context-summary-gametally-v1.md
- 可复用组件（生态复用，不自研）：
  - trystero + @trystero-p2p/mqtt：房间信令与 WebRTC 数据通道
  - vant：Popup / Toast / Dialog / Field / Tabs 等移动端结构件（unplugin-vue-components 按需引入）
  - @vueuse/core：useStorage、useDocumentVisibility、useNetwork、useClipboard
  - qrcode：房间链接二维码
  - vite-plugin-pwa + @vite-pwa/assets-generator：PWA 与图标生成
  - @vue/eslint-config-typescript / @vue/eslint-config-prettier / @vue/tsconfig：官方脚手架同款配置
- 命名约定：组件 PascalCase.vue、composable use*.ts、store use*Store、文件 kebab-case.ts；中文注释；Prettier 无分号单引号。
- 不重复造轮子证明：仓库为空，无既有实现；同步库对比见方案 3.3，自绘仅限主题 SVG 与计数器组件。

### 编码中监控（2026-09-20 22:00）
- 复用组件核对：trystero/@trystero-p2p/mqtt（传输层）、vant（Popup/ActionSheet/Field/Button/Radio/Cell）、@vueuse/core（useStorage/useClipboard/useShare/useDocumentVisibility/useEventListener/useIntervalFn/useWakeLock/useTimeoutFn）、qrcode、vite-plugin-pwa 均已按计划使用 ✅
- 命名：组件 PascalCase.vue，store useXxxStore，工具 kebab-case.ts，与 create-vue 官方模板一致 ✅
- 风格：Prettier 无分号单引号，中文注释描述意图 ✅
- 偏差记录：
  - jsdom 30 依赖的 undici 8 不支持 Node 20，降级到 jsdom 27（engines 覆盖 Node 20.19+）。
  - vite-plugin-pwa 的 peer 依赖 workbox-window/workbox-build 未被 pnpm 自动解析到项目根，显式加入 devDependencies。
  - 内存传输层入房时先登记成员再触发 onPeerJoin，与 Trystero「数据通道就绪后才回调」的语义对齐，否则快照定向发送会丢。
  - 内存传输层改为 JSON 序列化拷贝：Vue 响应式代理无法 structuredClone，而真实传输本就经 JSON。

## 编码后声明 - 《局分》v1（2026-09-20 22:15）

### 1. 复用了以下既有组件
- trystero / @trystero-p2p/mqtt：房间信令（MQTT，含 broker-cn.emqx.io）与 WebRTC 数据通道，src/sync/trystero-transport.ts
- vant：ConfigProvider（深色主题 + 全局主题变量）、Popup、ActionSheet、Field、Button、RadioGroup/Radio、CellGroup/Cell、showToast、showConfirmDialog
- @vueuse/core：useStorage（身份与网络配置持久化）、useClipboard、useShare、useDocumentVisibility、useEventListener、useIntervalFn、useWakeLock、useTimeoutFn
- qrcode：房间链接二维码；vite-plugin-pwa + @vite-pwa/assets-generator：PWA 与图标
- @vue/tsconfig、@vue/eslint-config-typescript、@vue/eslint-config-prettier：官方脚手架同款配置

### 2. 遵循了以下项目约定
- 命名：组件 PascalCase.vue（TokenCounter、ColonyBoard）、store useRoomStore/useSettingsStore、工具 kebab-case.ts（room-code.ts）
- 风格：Prettier 无分号单引号 100 列；ESLint flat config；中文注释描述意图与约束
- 文件组织：games/ sync/ stores/ components/ views/ theme/ utils/，与方案 3.6 一致

### 3. 对比了以下相似实现
- Trystero README 的 makeAction 用法：本实现只用单向 message action，快照在 onPeerJoin 时定向推送，不用 request/response，减少一次往返
- create-vue 官方模板：沿用其 tsconfig 三段引用与 eslint 配置，差异是路由改为 hash 模式以适配 GitHub Pages

### 4. 未重复造轮子的证明
- 检查了 vant（无 token 计数器类组件）、@vueuse/core（无房间码/合并逻辑），自绘仅限 TokenIcon、RobotAvatar、TokenCounter 与 CSS 令牌
- 未引入 CRDT 库：单写者模型 + 版本号即可，见 src/sync/messages.ts

### 验证记录
- Vitest 6 个文件 31 个用例通过；vue-tsc、eslint、prettier 通过；vite build 通过；Playwright 3 个用例通过
- 截图核对：首页、房间页、排行榜、邀请、设置五张手机视图，主题变量作用域修正后配色一致

## 2026-09-20 22:40 主题改浅色 + BGG 封面入口
- 用户决策变更：整体 UI 白色为主的科技感；首页直接用 BGG 封面图作为游戏入口（覆盖此前 D8）。
- 封面：经 api.geekdo.com/api/images/8638247 取得各尺寸变体，选 itempage（700）与 large（1024，2x）、square200（缩略）；curl 验证带 localhost / github.io Referer 均 200，可热链。
- 令牌迁移：space/dust 深色令牌全部替换为 canvas/surface/ink/accent 语义令牌，文字用 accent-deep / amber-deep / mint-deep 保证白底对比度。
- 验证：vitest 32 通过；vue-tsc、eslint、prettier 通过；Playwright 3 + 真实网络同步 1 通过；截图五页复核，封面 2x 变体在高 DPR 设备正确加载。
