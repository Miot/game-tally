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

## 2026-09-20 23:20 房间页重排 + 规则书 token 图标 + 月面背景
- 规则书：下载 riograndegames.com/wp-content/uploads/2024/07/MCB.pdf（12 页，无文字层），用 PyMuPDF 导出第 2 页 Contents 中的 1 单位 token（xref 18 人口 43px、16 钱 52×35、14 食物 50px），Lanczos 放大 3 倍存入 src/assets/games/moon-colony-bloodbath/，自绘 TokenIcon.vue 删除。
- 游戏定义新增 counters[].icon / color 与 backdrop 字段；快捷行动改为按影响的计数器归属：单计数器行动渲染在该计数器标题行右侧，多计数器行动渲染在顶部一行。
- 头部弱化为一行小字（头像 24px、昵称、状态、最近变动），撤销按钮移到该行右侧。
- 背景：components/backdrops 注册表按 backdrop 标识渲染；MoonBackdrop 为固定定位负 z-index 的 SVG。修正：装饰网格从 body 移到 html，否则 body 背景层级高于负 z-index 元素。
- 真实网络用例首次失败（4/4 中继已连但 60 秒未发现对等端），与截图脚本并发占用公共中继有关，单独重跑通过。

## 2026-09-20 23:50 真实网络用例波动排查
- 现象：双设备用例时过时不过；诊断脚本显示信令正常（双方 4/4 中继已连、互相发现），失败在 WebRTC 直连阶段，Trystero 报 could not connect to peer。
- 排除 1：把等待放宽到覆盖一轮 60 秒重公告仍失败 → 非丢公告。
- 排除 2：Playwright 加 --disable-features=WebRtcHideLocalIpsWithMdns 后成功率提高、发现耗时 5 秒，但仍偶发失败。
- 排除 3：不配置 STUN 三次全失败 → 本机候选本身不通。
- 根因：本机开着 VPN（utun4 198.18.0.1，默认路由仍是 en0 172.16.x），Chromium 只生成 198.18.0.1 的 host 候选，同机两个上下文之间 UDP 不通；有 STUN 时靠香港出口的 srflx 回环偶尔成功。
- 结论：应用实现无问题；该用例在无 VPN 的机器或真机上才稳定。保留 Playwright 的 mDNS 参数（对无 VPN 环境正确）、保留用例为 E2E_NETWORK 手动开启，并在 README 与验证报告注明。
- 顺带新增房间菜单「重新连接」：重新入房立即重新公告，用于公共中继丢公告时加速发现。

## 2026-09-21 00:10 首页精简
- 去掉左上角图标与「我是谁」模块（昵称改为进房间时在弹层补填，设置页仍可改）；桌游卡片去掉 BGG 跳转。
- 「回到房间」改为置顶的高亮卡片；房间码输入行移到封面之上。
- 端到端用例同步调整：创建房间后在房间页弹层起名；新增「回到房间」回流断言。

## 2026-09-21 00:20 精简测试与架构
- 删除 5 个低价值测试文件：games.spec.ts（断言常量，改数据即改测试）、memory-transport.spec.ts（测试的是测试替身本身）、messages.spec.ts 与 room-code.spec.ts（纯函数，已被集成/端到端间接覆盖）、TokenCounter.spec.ts（渲染细节，端到端已点过按钮）。
- 删除 tests/e2e/sync.spec.ts：双设备 WebRTC 直连受本机网络环境（VPN 虚拟网卡）影响而不稳定，真实结论只能靠真机；改为 README 的手动验证段落。
- room.spec.ts 从 10 个用例收敛到 5 个，只覆盖端到端测不到的多端同步；上下限边界移入端到端主流程用例（不新增用例）。
- 架构同步简化：删除 assertGameDefinition（约 30 行运行时校验，TypeScript 类型已保证结构，且仅一个游戏定义）；测试环境从 jsdom 改为 node；移除 @vue/test-utils、jsdom、@types/jsdom 三个依赖；playwright.config.ts 恢复默认 launchOptions。
- 顺带修复：上一轮编辑首页时丢失的设计师署名行已补回。
- 结果：测试 572 行 → 178 行，8 个文件 → 2 个；单元测试 686ms → 156ms。

## 2026-09-21 00:50 token 图标改矢量、背景贴合游戏

### 素材调研（结论：官方无高清资源）
- Rio Grande 官方规则书 MCB.pdf 与 Moon_Colony_Bloodbath_Rulebook.pdf 内容一致，全文 120 张内嵌位图，token 类最大仅 65×43px，放大必糊。
- 规则书第 4 页的玩家垫板图（829×399）里资源图标同样只有十余像素。
- BGG 图片库（api.geekdo.com/api/images）中与组件相关的都是实物照片：卡牌 4000×3000、LaserLand 第三方亚克力 token 4032×3024、3D 插件 3000×4000。有透视、光照与阴影，且亚克力件是简化轮廓而非官方美术，不能当 UI 图标。
- 结论：无官方矢量可用，改为依据规则书图案重绘 SVG，保留识别特征（宇航员、双峰矿产标志、青苹果），配色适配浅色界面。PNG 55KB → SVG 3.8KB。

### 背景
- 依照封面与垫板重画 MoonBackdrop：远景环形山脊、玻璃穹顶城市（内有建筑与暖黄灯）、通信塔、火箭着陆平台、复古未来主义机器人、天上的地球、月壤与陨石坑。
- 构图经三轮调整：房间页被卡片占满，实际露出背景的只有顶部约 160px，因此把整条天际线压到地平线 y=172（viewBox 430×900），并把机器人与着陆平台左移，避开右上角的撤销按钮。
- preserveAspectRatio 用 xMidYMin slice，保证宽屏下裁的是底部月壤而非顶部天际线。

## 2026-09-21 01:30 底部栏并入菜单、封面做沉浸式背景

### 交互
- 删除底部固定的「邀请 / 排行榜」按钮栏，邀请移入右上角 ⋯ 菜单（排行榜原本就在菜单里），正文下边距由 pb-24 收到 pb-8，一屏能放下三张计数卡。
- 端到端用例改走菜单路径打开邀请。

### 背景
- 先尝试整页深色主题贴合封面，用户否决：卡片与按钮保持白色，只改背景。已回滚 App.vue 的主题切换、main.css 的 .theme-game、计数器读数色与菜单项色值。
- 手绘的 MoonBackdrop 与 components/backdrops 注册表整体删除，GameDefinition 去掉 backdrop 字段；改为通用的 CoverBackdrop：直接用游戏封面，任何游戏复用，不再逐个绘制。
- 背景形态经三轮调整：放大+高斯模糊铺满 → 模糊过度认不出封面 → 按用户要求改为封面满宽完整展示在视口上半部分（高度由图片比例决定，约 50vh），向下渐隐到画布色。
- 配套修复：ColonyBoard 顶部那行浮在封面之上，文字改装进半透明药丸；顺带补回之前改动中漏掉渲染的「最近变动」文本。

## 2026-09-21 01:45 封面背景加高斯模糊
- 反馈：清晰封面让浮在上面的房间码、切换条、昵称一行难以辨认。
- 处理：img 加 blur-md（12px），并用 scale-105 裁掉模糊在图片边缘留下的透明带。scale 属于 transform，不改变布局高度，因此封面仍完整占上半屏。
- 顶部遮罩由 canvas/40 提到 canvas/55，中段由 /15 提到 /28。

## 2026-09-21 02:00 背景改为纯黑加模糊光晕
- 反馈：不要用封面做背景，改为黑色背景加高斯模糊。
- CoverBackdrop 删除，改为 RoomBackdrop：#05070d 黑底 + 四团 blur-3xl 的色光晕（青、琥珀、紫、蓝），只做氛围不含可辨认图像。背景不再依赖游戏数据。
- 昵称一行的药丸由半透明改回不透明白色（半透明是为了在封面上可读，黑底下会发灰）。

## 2026-09-21 02:20 切换条可读性与点击反馈加强
- 玩家切换条：选中态原本是 bg-accent/10（10% 透明青），在黑底上几乎透明，导致深色文字不可辨。改为两态同用不透明 bg-surface，选中靠 border-accent + shadow-glow-accent 区分。
- 计数点击反馈由单一描边闪烁升级为三重：
  1. 卡片闪色 —— 底色用 color-mix 混入 12% 主题色，同时改描边与投影，520ms；
  2. 读数弹跳 —— 增加上扬、减少下沉，420ms，方向本身即反馈；
  3. 增量气泡 —— 读数右侧浮出 +N / −N 并淡出，700ms。
- 三者先清空再在下一帧赋值，连点时动画会重新播放；720ms 后统一清理，卡片完全恢复原状。

## 2026-09-21 08:20 发布与部署
- 推送 12 个提交到 github.com/Miot/game-tally。
- 首次部署受阻：免费套餐下私有仓库不支持 Pages（创建 Pages 返回 422），且 Actions 因账单问题 job 未启动。经用户确认后仓库已改为公开。
- 启用 Pages（build_type=workflow），手动触发部署：build 26s、deploy 8s，均成功。
- 线上校验：首页与入口脚本、manifest.webmanifest、sw.js、favicon.svg 全部 200；Playwright 访问线上地址跑通建房、起名、记分（-5 后为 25），封面加载成功，控制台无错误。
- 顺带消除工作流的 Node 20 弃用警告：checkout v4→v7、pnpm/action-setup v4→v6、setup-node v4→v7、configure-pages v5→v6、upload-pages-artifact v3→v5、deploy-pages v4→v5。

## 2026-09-21 09:00 同步方案由 WebRTC 改为 MQTT 中继直传

### 问题
用户反馈电脑与手机互相连不上。线上诊断：四个中继全部 open，两端通过中继**互相发现了对方**（日志里带对方 peerId），失败在 WebRTC 直连，Trystero 报 "could not connect to peer … configure TURN servers"。用户确认网络为电脑 Wi-Fi、手机蜂窝。

### 定性
蜂窝网络的运营商 NAT 基本为对称型，STUN 无法穿透，必须 TURN 中转。实测所有已知免费公共 TURN（openrelay / staticauth.openrelay.metered.ca 的 80/443/443-tcp）均返回 err701/err400，公开凭证已失效。即协议层面无解，非代码缺陷。

### 方案
既然信令本来就走公共 MQTT 中继，而计分数据仅数百字节，直接用中继转发即可绕开 NAT 穿透。
- 新增 src/sync/mqtt-transport.ts，实现既有的 RoomTransport 接口，room store 与测试替身均无需改动。
- 协议：join / beat / bye / msg 四类消息，8 秒心跳、26 秒静默判离线、LWT 兜底异常断开；同连三个中继做冗余，按消息 id 去重。
- 移除 trystero 与 @trystero-p2p/mqtt 依赖，删除 trystero-transport.ts；网络配置由 STUN/TURN/信令策略简化为中继列表。
- 修正：中继状态改用 mqtt.js 的 connected/reconnecting 标志，浏览器端拿不到底层 socket 的 readyState。

### 验证
- 中继实测：broker-cn.emqx.io 连接 1.9s、broker.emqx.io 1.5s、broker.hivemq.com 3.3s，往返均约 380ms，260B 数据一致；test.mosquitto.org 连接失败，已移出默认列表。
- 单人入房 0.5s，3.5s 内三个中继全部 open，状态灯正确。
- 两端同步：互相发现后改分即同步，他人视角只读，6.4s 跑完端到端用例。

## 2026-09-21 impeccable init：捕获产品事实

- 扫描 README、docs/plan-v1.md、src/games、src/theme/main.css、stores 与本日志，确认平台（web / PWA / 移动端优先）、技术栈、同步机制与已实现能力，不再向用户重复提问。
- 三处仓库无法回答的缺口经用户拍板：
  1. 定位 = **通用桌游计分器**，游戏覆盖面持续扩展，MCB 只是第一款；
  2. plan-v1.md 2.3 节中未实现的结算页、事件流 / 撤销、单机模式**全部不做**，功能面停在当前形态；
  3. 游戏封面**维持引用 BGG 图片 CDN**，README 中「不使用出版社的封面与卡图」一句与现状冲突，已按此立场更正。
- 产出 PRODUCT.md（产品事实唯一来源，不含任何视觉决策）与 .impeccable/live/config.json（Vite 单壳 SPA，注入 index.html；detect-csp 返回 shape=null，无需 CSP 放行）。
- 未产出 DESIGN.md：视觉体系的记录属于 /impeccable document 的职责，init 不写。

## 2026-09-21 整体界面重构：从科技控制台改为计分纸

### 起因与边界
用户要求「重构整体 UI，使其更符合桌游的主题」。三处歧义先行确认：
1. 「桌游主题」指**桌游品类的物质世界**而非单款游戏世界，实现为「外壳通用 + 房间页按游戏换皮」；
2. 必须保留的只有 **BGG 真实封面入口**，机器人头像与 Vant 组件层均允许重做；
3. 实际使用光线是**明亮日光或白光** —— 这一条直接否定了旧版房间页的黑底与 plan-v1.md 2.5 节的「深色为默认」。

### 方向选择
按 impeccable 的 concept-seed 摇号（seed `a0523431`，scope direction，mode operate）。先推导七个候选视觉世界，跨纸品／纸板／印刷／木质／模切／图表六个材料族，把品类定式（深色霓虹记分台，即本项目旧版）与其可预测的反面（无装饰字体极简）排除在候选外。摇号分配到第 3 位「规则书」，我的首选第 1 位「计分纸」按规则另出一张 IMPECCABLE'S PICK 卡。六张目录挑战牌逐一融合后全部判 declined（在受众认同与产品清晰度两轴上均输），其纪律提炼成六条 raise 并入方向。**用户最终选中 PICK 卡：计分纸。**

构建路径 code-led（本机无图像生成能力，无 comp）。方向契约六块写入 `.impeccable/surfaces/src-views-roomview-vue.md`。

### 主要改动
- **信息架构**：房间页从「一次看一个玩家的三个计数器 + 顶部切换条」改为「上半屏全桌计分表（行＝玩家、列＝资源、末列名次）+ 下半屏只属于自己的写字板」。这直接兑现 PRODUCT.md 里「抬头一看就知道全桌状态与排名」那句产品目的。他人视角渲染为 NCR 复写黄联并盖「副本」章，不渲染任何控件 —— 只读不是被禁用的按钮，而是另一张纸。
- **移除 Vant**：Button/Field/Popup/ActionSheet/Dialog/Toast 全部自写（`PadButton`、`PadField`、`PadSheet`、`PadFeedbackHost`、`src/ui/feedback.ts`）。套现成组件库的圆角药丸会直接破坏这套世界。
- **字体**：Orbitron（科技控制台的残留）换为自托管 Archivo Variable，wght+wdth 双轴，仅 latin 子集；中文走系统栈不下载字体。
- **玩家标识**：机器人头像换为形状＋油墨色双重编码的指示物（`theme/markers.ts`），色觉差异的玩家不依赖色相也能认出自己那一行。
- **图标**：`←` `⋯` `→` 等 Unicode 字形全部换成统一 1.75 笔画的自绘 SVG（`PadIcon.vue`）。
- **换皮接口**：`GameDefinition.theme` 只含 paper／rule／mark 三色，房间根元素上覆盖 CSS 变量即可，新增游戏不必改任何组件。

### 验证
- vue-tsc、ESLint、Prettier 通过；Vitest 5 项通过；Playwright e2e 3 项通过（同步用例需外网中继，按设计跳过）；`impeccable detect --json` 零发现。
- 截图验证用真实两端连公共 MQTT 中继 + 缓存伪造一个出局玩家，一张表里同时覆盖在线／离线／出局三种记号，手机 390×844 与桌面 1440 两组视口。
- 体积：移除 Vant、字体只留 latin 子集后，PWA 预缓存 765KB → 649KB。

### 收尾审查
独立上下文的 impeccable-finish-reviewer 返回 `fix`，列出 8 条。全部成立并已批量修复，其中两条是我判断错的：
- 离线读数 `pencil-light` 在 14px 正文尺寸下只有 3.11:1（我误按大文本 3:1 标准验收），已改 `pencil` 4.87:1；
- 我给「中间大片空白」辩护的理由本身就指向正解 —— 真纸的延续是**预印空行**而不是空白，已补 `.pre-ruled` 格线与预印页脚。
其余六条：契约点名的三处印刷红全部补上、资源色从数字墨色改为整片实色标签块、首页与设置页从卡片堆合并为一张纸、主次资源补上材质差、复写联读数换碳墨、出局播报由转瞬 toast 改为纸上的持久记号。

## 2026-09-21 房间页版面重排：记分面板回到主体位置

### 反馈
用户指出：「操作计分的面板被弱化了，大部分是同房间的玩家计分版，我的目的是协助自己计分，看其他人的是次要能力。」

这条成立，而且是 Operate 模式下的典型失误 —— 表达遮蔽了任务。上一版为了兑现「一张纸上全桌所有人的数」这个 thesis，把全桌表＋预印空行＋页脚堆到约 62% 的屏幕，主任务（改自己的数）只剩 38%。概念压过了任务。

### 用户拍板的两条
1. 全桌**折叠起来，需要时展开**（而不是只留幸存者列或保留完整三列）。
2. 多出来的空间**三个资源均分**（而不是全给加大按钮，或全给主资源）。

### 改动
- 新增 `ScorePadSummary.vue`：全桌折成约 48px 一行。折叠态下必须保住的信息有两类 —— 谁领先／我第几，以及**有人出局时的「本局结束」**。后者是规则层面的信息，不能因为折起就看不见，所以出局时整条转红。
- `RoomView.vue`：删除预印空行与页脚（释放约 206px），写字板改为 `flex-1` 拿走全部剩余高度，占比从 38% 升到约 88%。展开的全桌表限高 38dvh 可滚动。
- `CounterRow.vue`：取消主／次资源的结构差异，三行等高等大；主步进键 64px 实心压印、副步进键 52px 空心框，这个材质差对每个资源一视同仁；排行依据改用「· 排行依据」文字标注，不再靠尺寸区分。
- `main.css`：`.pre-ruled` 失去用途，整段删除而非留着。

### 过程中抓到的两个真问题
1. **单人时摘要条自称「领先 我 30 · 我第 1 · 共 1 人」** —— 一个人有什么领先。是 e2e 失败暴露的，改组件而非迁就测试：玩家数 ≤1 时直接写「只有你一个人」。
2. **读数破百会撑破定宽的加减键** —— 中间读数区实测约 106px，而 64px 的三位数需要约 106px，正好临界。改为破百降一档到 40px（仍在既有三档内，不引入流体字号），并用 999/128/104 三个值截图验证。

### 验证
- e2e 两条用例因「全桌默认折叠、chip 不再常驻」而失败，这是预期内的行为变化，已让测试跟上新交互而不是反过来：先断言折叠条的文案，再展开断言表内容。4 项全通过。
- vue-tsc、ESLint、Prettier、12 项单测、构建、`impeccable detect` 均通过。
- 方向契约的 THESIS 与 FIRST VIEWPORT 已同步重写，避免后续照着过时的版面走。

## 2026-09-21 资源行打磨：名称放大、主键上色、快捷行动归位

### 反馈
用户：「优化下目前房间界面中，增减资源的交互和显示，现在的UI资源名称小小的，整体UI不好看。」随后追加：「采矿+4钱 和 耕作+4食物 放到对应的卡片中，注意保持整体设计的一致性。」

诊断：资源名只有 11px，在 64px 读数与 64px 按键旁边读不出来；六枚石墨实心键（两枚 × 三行）视觉重量压过读数，而读数才是主角。

### 用户拍板
从三个排布方案里选了「读数居中、主键改资源色」；交互明确**不加**长按连击与点读数输入，只保留既有的震动反馈。

### 改动
- 资源名 `label-cn` 11px → `lead` 20px，仍是整片资源实色底 + 纸白字。这是 `lead` 档的新用途。
- 主步进键的底与边框从石墨换成该行资源色。每行三处同色（名称块 + 两枚主键），行与行靠颜色分开；副步进键保持空心石墨，材质差不变。
- **快捷行动归入对应资源卡片**：只作用于单个资源的行动渲染在该行标题行右侧，用同色空心框（实心＝主要、空心＝次要）。影响多个资源的行动仍留在底部单独一排 —— 数据模型允许，MCB 没有，所以底部不渲染。
- 「起始 N」与铅笔痕一起移到读数正下方，成为这个数的注解行。这同时解决了痕迹「+4」与按钮「采矿 +4」撞车的问题。

### 一处实现上的坑
主键用资源色时**不能用内联 `background-color`** —— 内联样式优先级最高，会盖掉 `.tap:disabled` 的灰底，到达上下限的键不会变灰。改为行根元素上设 `--key-ink` 变量、键用 `bg-[var(--key-ink)]` 引用，禁用态才能正常覆盖。已用 999 上限截图验证。

### 验证
vue-tsc、ESLint、Prettier、12 项单测、4 项 e2e、`impeccable detect` 零发现；折叠态／展开态／只读黄联／破百禁用四种状态均已截图复核。

## 2026-09-21 快捷行动改放读数正下方

用户：「资源快捷行动按钮的位置在卡片里不太自然，重新设计下。」追问后明确：「放在相应的资源分正下方。」

上一版把行动键放在标题行右端、用 `ml-auto` 顶到最右。不自然的原因是位置与身份不符 —— 它是个**操作**，却被放进标题区，和其他操作控件（±键）隔开；而且与资源名之间横着一大片空白，两者读起来毫无关系。

改为：行动键居中落在读数正下方，与那个数对齐 —— 它改的就是这个数。层级也顺了：步进键在两侧（改一点），行动键在下方（游戏里的一步），两者靠填充区分（实心 vs 空心）而非位置随意。没有行动的资源（幸存者）不渲染这一行。

DESIGN.md 与 design.json 的对应描述已手工同步（改动只是位置，不值得再跑一轮文档 agent）。验证：类型检查、lint、12 项单测、4 项 e2e、构建均通过。

## 2026-09-21 行动键加大 + 盖章动效

用户：「快捷按钮太小了，做大点，加点动画什么的。」

### 尺寸
44px → 56px 高，文字 11px → 14px 粗体，横向内边距 20 → 24px。它仍是空心框（次要于 64px 的实心主步进键），但不再像个角标。

### 动效：盖章
「加点动画」没有细说，但这套世界的运动语法已经定死是**只有平移与压印、无弹跳无发光**，所以在语法内做，而不是推翻它。

行动键按下的瞬间墨色灌满整个框、纸面被压下 1px（40ms）；松手后墨迹用 260ms 缓慢渗进纸里，只留下印框。压下快、渗回慢 —— 慢的那一半不挡任何操作，它是「这笔已经落纸」的证据。

同一时刻读数在 `ink-set` 里落定、`nib-stroke` 从格底划过、页边多出一道铅笔痕。四件事合成这套界面唯一一处被编排过的时刻，且来自世界本身（印章、墨、纸），不是通用的悬停抬升。

纯 CSS transition 实现（`.tap-stamp`），无 JS、无需处理连点重启，成本可忽略。降低动效偏好下保留墨色变化（落没落必须看得见），只收掉位移。

### 验证
用 Playwright 按住不放截下了按下态与松手后的中间态：`mobile-stamp-down.png` 可见墨色灌满、旁边未按的键仍是空心；`mobile-stamp-release.png` 同时拍到墨迹渗回、读数 8→12、红色笔尖线划过格底、铅笔痕多出一个 +4 —— 整条连锁成立。

类型检查、lint、12 项单测、4 项 e2e、检测器零发现。

## 2026-09-21 去掉单人邀请条，邀请入口移入表头栏

用户：「『把房间号给同桌』那一行的功能进入页面后延迟出现导致整体闪动，这行之间去掉，把邀请按钮放在顶部房间号旁边，仅用图标展示就行了。」

### 闪动的根因
那一条的显示条件是 `room.phase === 'joined' && orderedPlayers.length <= 1`。`phase` 要等入房握手完成才变成 `joined`，于是它在进房后才插进 DOM，把下方的写字板整体推下去 —— 读作闪动。这类**随连接状态出现的横条**天然会造成布局跳动。

### 改动
- 删除该条与 `alone` computed。
- 邀请改为表头栏上一枚常驻的二维码图标键（房间号右侧，仅图标，`aria-label="邀请同桌"`），不随人数出现或消失，因此不可能再引起插入式跳动。菜单里的「邀请同桌」保留。
- 单人时的提示仍在全桌折叠条上（「只有你一个人」），它是常驻区块内的文案变化，不改变布局。

### 顺带立的一条规则
DESIGN.md 的版面段补了一句：房间页除展开的全桌表外**不得有条件插入的区块**，这类入口一律放进常驻的表头栏。这是从这次闪动里提炼的，不只是修一处。

### 验证
360px 窄屏专门截了一张（`narrow-360.png`）确认加了图标键之后表头栏仍放得下：返回、房间号、二维码、连接状态、菜单齐全无溢出。4 项 e2e、12 项单测、类型检查、lint、检测器零发现全过。
