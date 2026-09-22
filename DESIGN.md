---
name: 局分 GameTally
description: 桌游盒里那本预印计分纸，搬到每个人自己的手机上。
colors:
  paper: "#f7f7f5"
  paper-2: "#edece7"
  paper-3: "#e2e0d9"
  desk: "#d6d4cc"
  carbon: "#f4e8b4"
  carbon-2: "#e8d992"
  carbon-line: "#cbb469"
  carbon-ink: "#5f5949"
  rule: "#b4c8d6"
  graphite: "#22201e"
  pencil: "#6f6c64"
  pencil-light: "#8f8b82"
  mark: "#c8102e"
  mark-soft: "#f6dee2"
  resource-ink-blue: "#1d4ed8"
  resource-ink-amber: "#b45309"
  resource-ink-green: "#15803d"
  marker-ink-blue: "#14538d"
  marker-ink-red: "#a6242b"
  marker-ink-green: "#1f6b45"
  marker-ink-ochre: "#8a5a12"
  marker-ink-violet: "#5b3a8e"
  marker-ink-teal: "#0f6b6b"
  marker-ink-magenta: "#93286b"
  marker-ink-slate: "#3f4a55"
typography:
  lead:
    fontFamily: "Archivo Variable, system-ui, -apple-system, PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, Microsoft YaHei, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariation: "wdth 108"
  body:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "0.6875rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "0.14em"
    fontVariation: "wdth 88"
  label-cn:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "0.6875rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.06em"
  num-s:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum 1, lnum 1"
    fontVariation: "wdth 96"
  num-m:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum 1, lnum 1"
    fontVariation: "wdth 96"
  num-l:
    fontFamily: "{typography.lead.fontFamily}"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum 1, lnum 1"
    fontVariation: "wdth 96"
rounded:
  none: "0px"
spacing:
  gutter: "12px"
  tight: "6px"
  row-pad: "8px"
  block: "16px"
  pad-row: "2.875rem"
  tap-min: "44px"
  summary-bar: "48px"
  quick-key: "48px"
  sub-key: "52px"
  main-key: "64px"
  table-max: "38dvh"
  page-max: "28rem"
components:
  button-solid:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
    typography: "{typography.label-cn}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "{spacing.tap-min}"
  button-solid-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
  button-solid-mark:
    backgroundColor: "{colors.mark}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.label-cn}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "{spacing.tap-min}"
  button-outline-active:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
  button-disabled:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.pencil-light}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.pencil}"
    typography: "{typography.label-cn}"
    padding: "4px 0"
  key-main:
    backgroundColor: "{colors.resource-ink-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.num-s}"
    rounded: "{rounded.none}"
    size: "{spacing.main-key}"
  key-sub:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    size: "{spacing.sub-key}"
  key-quick:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.label-cn}"
    rounded: "{rounded.none}"
    padding: "0 8px"
    height: "{spacing.quick-key}"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 0"
    height: "{spacing.tap-min}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
  summary-bar:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.graphite}"
    typography: "{typography.label-cn}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "{spacing.summary-bar}"
  summary-bar-alert:
    backgroundColor: "{colors.mark-soft}"
    textColor: "{colors.mark}"
  table-header:
    backgroundColor: "{colors.mark}"
    textColor: "{colors.paper}"
    typography: "{typography.label-cn}"
    rounded: "{rounded.none}"
    padding: "10px 12px 8px"
  row-active:
    backgroundColor: "{colors.paper-3}"
    textColor: "{colors.graphite}"
    height: "{spacing.pad-row}"
  carbon-copy:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.none}"
  resource-tag:
    backgroundColor: "{colors.resource-ink-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.lead}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
---

# Design System: 局分 GameTally

## Overview

**Creative North Star: "预印计分纸（The Pre-Printed Score Pad）"**

整个界面是一张纸，不是一个应用。冷白胶版纸上预先印好了青蓝格线、红色表头条和列名，玩家做的唯一一件事是在自己那一格里写数。所有层级都由印刷厂能做到的手段造出来：线宽、字距、字宽、实色套印、纸张本身的颜色。凡是印刷做不到的（发光、模糊、圆角药丸、渐变、悬浮卡片阴影）都不属于这个世界。

这张纸的版面是按任务分配的，不是按信息量分配的：自己那一栏占掉整页的大部分，全桌的参照压成顶端一条 48px 的折叠条，需要时才展开。三个资源在写字板上等高等大，因为它们在牌桌上被同样频繁地增减——分量不由尺寸宣布，由材质宣布（实心压印的主步进键 vs 空心框的副步进键），身份则由各自的资源色宣布（名称块、两枚主键、这支资源自己的快捷行动同色）。

深度只有一层：压在计分表下方的那块写字板。颜色极度节制：全站真正的彩色只有印刷红、资源实色标签块和八枚玩家指示物油墨，其余全是纸色与石墨、铅笔灰。明确拒绝的反面：深色霓虹记分台、圆角卡片、发光药丸（本项目上一版正是如此），以及它可预测的另一极——无装饰的字体极简。

**Key Characteristics:**
- 版面按任务分配：操作面板主导，参照信息折叠
- 线宽只有两档：1px 青蓝发丝格线、2px 石墨粗规则线
- 圆角为零，纸是裁切的不是打磨的
- 文本三档 + 数字三档，层级差另由 Archivo 的 wdth 轴承担
- 状态由记号传达（划线、空心、复写联、盖章），不靠色相
- 深度只有一层：写字板压在计分表上
- 运动只有平移与压印，无弹跳无发光

## Colors

一张冷白纸、一支石墨笔、一道印刷红，加上作为底材出现的资源实色与玩家油墨。

### Primary
- **印刷红 Mark**（`{colors.mark}`）：套印色，用途收在少数几处——展开表的表头条实底、我那一行的常驻方形标记、合计收尾线、出局横穿线，以及折叠条上的出局警示文字与图标。破坏性确认键与警告便条的描边也取它。它的稀有是设计的一部分。
- **红晕纸 Mark Soft**（`{colors.mark-soft}`）：有人出局时整条折叠条的底色，以及写字板上的出局提示条。印刷红在纸上的淡晕，不作他用。

### Secondary
- **资源实色**（由游戏定义提供，《月球殖民地》为幸存者 `{colors.resource-ink-blue}`、钱 `{colors.resource-ink-amber}`、食物 `{colors.resource-ink-green}`）：一个资源的身份色，只出现在这支资源自己的卡片里：名称块（整片实色 + 纸白字）、两枚主步进键（整片实色 + 纸白字，含边框）、读数正下方那个只作用于本资源的快捷行动（同色 2px 空心框 + 同色文字）。跨资源的行动留在写字板底部，那里用石墨框，被作用的资源名取各自的身份色（数据模型支持，《月球殖民地》没有这类行动，因此当前不渲染）。资源色永远是整片实色、同色描边或实色文字，不做渐变、不做淡化底。三个资源的名称块与按键尺寸一致——资源色是身份，不是权重。资源色绝不作为读数的颜色。
- **玩家油墨八色**（`{colors.marker-ink-blue}` 起共 8 支）：玩家指示物的填色，与形状构成双重编码。

### Neutral
- **胶版纸 Paper**（`{colors.paper}`）：主纸面。叠加一层 4% 不透明的分形噪声纤维，纤维随纸走，不铺到桌面上。
- **纸二 / 纸三**（`{colors.paper-2}` / `{colors.paper-3}`）：纸二是全桌折叠条的常态底，纸三是展开表里当前查看行的行底色。都是同一张纸的不同受光，不是新的表面。
- **桌面 Desk**（`{colors.desk}`）：≥768px 时纸背后的桌子。
- **石墨 Graphite**（`{colors.graphite}`）：正文、读数、粗规则线、实心压印块。手写的那支笔只有这一支。
- **铅笔 Pencil / 淡铅笔 Pencil Light**（`{colors.pencil}` / `{colors.pencil-light}`）：次要文本（折叠条上的「领先」「我第 N · 共 M 人」、标签行的「起始 N · 排行依据」）与离线者的读数；淡铅笔专用于页边痕迹与禁用态。
- **发丝格线 Rule**（`{colors.rule}`）：预印的青蓝，永远 1px，永不加粗（聚焦时是换成石墨 2px，不是把它调深）。
- **NCR 复写黄联 Carbon 家族**（`{colors.carbon}` / `{colors.carbon-2}` / `{colors.carbon-line}` / `{colors.carbon-ink}`）：他人视角的只读副本。黄联上格线换成 `{colors.carbon-line}`，读数换成碳墨——复写出来的字比原件淡而发灰。

### Named Rules
**The Sparing Mark Rule.** 印刷红只出现在表头条、我那一行的常驻标记、合计收尾线、出局横线，以及折叠条上的出局警示。多一处，红就不再意味"这是印上去的"。

**The Ink Is One Pen Rule.** 所有读数都是石墨，因为纸上的数字是同一支笔写的。资源的颜色属于底材（标签块），不属于手写的数字。唯一的例外是复写黄联，那里读数改用碳墨。

**The Marker Not Hue Rule.** 任何状态都必须有一个非色相的记号：离线＝空心指示物＋铅笔灰读数，出局＝横穿整行的一笔＋"失败"标签（折叠态下则是警示图标＋整条换底），只读＝黄联＋"副本"盖章，中继＝实心／空心呼吸／划掉的圈。色相只是附带。

**The Variable Ink Rule.** 控件的背景与边框着色走行级 CSS 变量（`--key-ink`）+ 工具类，不走内联 `style`。内联样式优先级最高，会盖掉禁用态的灰底，让已经到达上下限的按键看起来仍可按。着色方式必须给状态样式留出覆盖的余地；纯文字着色不受此限。

**The Reskin Surface Rule.** 换皮接口只有 `--color-paper` / `--color-rule` / `--color-mark` 三个变量，写在房间页根元素上，`--color-mark-soft` 由 `color-mix(in oklab, mark 12%, paper)` 派生。新增游戏不得为换皮触碰任何组件，也不得扩张这三个之外的变量。

## Typography

**一套面：** Archivo Variable（wght 100–900 + wdth 62–125 双轴，仅 latin 子集），中文回落系统栈（PingFang SC / Hiragino Sans GB / Noto Sans CJK SC / Microsoft YaHei）。中文不下载任何字体。

**Character:** 一款为报刊表格而生的窄可变无衬线。层级不靠多加字号档，而靠 wdth 轴：标签压窄到 88% 像铅字预印的列头，小标题拉宽到 108% 取得存在感，数字收在 96% 保持格内对齐。

### Hierarchy
- **Lead**（`{typography.lead}`，wdth 108%）：页面级标题与区块小标题（如"局分""附注"），以及写字板上的资源名称块——资源名是那一行的标题，不是角标。全站最大的文字仍然只有 20px。
- **Body**（`{typography.body}`）：正文、玩家名、副步进键上的 ±N。
- **Label**（`{typography.label}`，大写 + 0.14em 字距 + wdth 88%）：拉丁文预印标签，如 "GameTally"。仅用于拉丁文。
- **Label CN**（`{typography.label-cn}`，不大写、0.06em 字距）：中文预印标签，列头、区块名、折叠条文字、按钮文字。中文不做大写与宽字距，否则会散架。
- **Num S / M / L**（`{typography.num-s}` / `{typography.num-m}` / `{typography.num-l}`）：
  - **24px（num-s）**：展开表内的主资源读数、房间码，以及实心压印键上的步进数字。
  - **40px（num-m）**：折叠条上的领先值，以及写字板读数破百后降下来的那一档。
  - **64px（num-l）**：写字板上的常规读数，三个资源一视同仁。

### Named Rules
**The Three-and-Three Rule.** 文本只有 11 / 14 / 20 三档，数字只有 24 / 40 / 64 三档。需要更强的层级时调 wdth 轴与字重，不新增字号档。

**The Drop-a-Step Rule.** 加减键是定宽的，读数格不能被撑破。数值达到三位数（≥100）时读数落到下一档（64→40），而不是引入流体字号或让数字溢出。

**The Tabular Always Rule.** 任何数字都是格子里的数字：一律 `tabular-nums lining-nums`，数值跳动时字形宽度不得变化。

## Layout

单列纸张，最大宽度 448px（`{spacing.page-max}`）居中；手机上铺满，≥768px 时纸背后露出桌面色、纸的左右是 2px 石墨裁切边并落一道柔和投影。

间距节奏很短：横向排水沟 12px，纵向行内 8px，元素间隙 6/8/12px，区块间 16px。间距不承担分隔职责——分隔由线承担，所以相邻区块可以紧贴，中间只有一条发丝线。

**房间页是一套高度分配，不是一串堆叠的区块。** 自上而下：表头栏（固定高，粗规则线收底）→ 全桌折叠条（固定约 48px）→ 展开时的全桌表（可滚动，最高 38dvh，粗规则线收底）→ 写字板（`flex-1`，拿走剩余的全部高度）。除展开的全桌表外没有任何条件插入的区块 —— 会随连接状态出现的横条会在进房那一刻把下方内容整体推走，读作闪动；这类入口一律放进常驻的表头栏。折叠条默认收起，所以进房第一眼绝大部分屏幕属于"改自己的数"。

写字板内部同样是高度分配：表头行与跨资源行动条固定，三个资源行各取 `flex-1` 等分剩余高度。屏幕更高时长出来的空间归资源行，不归任何参照信息。

触控目标不小于 44px，主要操作在下半屏拇指可达区；主步进键 64px、副步进键 52px、行内行动键 56px、底部跨资源行动条 48px、折叠条 48px。展开表的行高是单一常量 `--pad-row: 2.875rem`（46px），它同时是那一行的触控高度。安全区由外壳的 `env(safe-area-inset-*)` 吸收；写字板把自身高度写成 `--pad-board-h`，便条据此停在它上沿之外。

### Named Rules
**The Task Owns the Page Rule.** 版面按任务分配高度，不按信息量。访客此刻要做的那件事（在房间页是改自己的数）拿走剩余的全部高度；参照信息折叠成一条固定高度的横条，展开后也必须有上限（全桌表 ≤38dvh），不得再把操作面板挤成配角。

**The Folded Bar Still Speaks Rule.** 折叠掉一块内容，就必须在折叠条上保住它的结论。全桌折叠条在任何状态下都要回答"谁在领先、我在第几"；一旦出现规则层面的终局（有人出局），整条换成红晕底 + 警示图标 + 明文，不能因为收起来就看不见。

**The Equal Weight Rule.** 同类元素在同一块面板里等高等大。差别由材质表达（实心压印 vs 空心框）、由标注表达（"排行依据"）、由身份色表达（每行自己的资源色），不由尺寸表达。

### 盖章（行动键的焦点时刻）

行动键是一枚印章。按下的瞬间墨色灌满整个框、纸面被压下 1px（40ms）；松手后墨迹用 260ms 缓慢渗进纸里，只留下印框。压下要快、渗回可以慢——慢的那一半不挡任何操作，它是"这笔已经落纸"的证据。

同一时刻读数在 `ink-set` 里落定、`nib-stroke` 从格底划过、页边多出一道铅笔痕。这四件事构成这套界面唯一一处被编排过的时刻；它来自这个世界本身（印章、墨、纸），不是通用的悬停抬升。

降低动效偏好下保留墨色变化（落没落必须看得见），只收掉压下的位移。

## Elevation & Depth

纸是平的。全站没有卡片阴影、没有分层浮起、没有模糊背景。深度只表达一件事：有东西压在纸上。

### Shadow Vocabulary
- **写字板 Board**（`box-shadow: 0 -10px 28px -12px rgba(34,32,30,0.28)`）：写字板向上投在上方内容上的影。全站唯一常驻的投影，它标出"这块是垫板，笔落在这里"。
- **抬起 Lift**（`box-shadow: 0 6px 20px -8px rgba(34,32,30,0.32)`）：桌面视图中整张纸落在桌子上的影，以及便条／确认便签这类临时压在页面上的纸片。

### Named Rules
**The One Shadow Rule.** 投影只允许表达"一张纸压在另一张纸上"。状态变化（悬停、选中、聚焦、展开／收起）一律不产生投影——它们用底色、线宽、反白或角标旋转表达。

## Shapes

圆角为零，全站唯一的半径令牌是 `{rounded.none}`。矩形不是风格选择，是裁切的结果。

形状语言只有三种元素：**线**（1px 青蓝发丝 / 2px 石墨规则，没有第三档）、**实色块**（表头条、资源标签、实心压印键、玩家指示物）、**空框**（2px 石墨描边 + 纸底的行动格）。所有边框都是 2px 石墨或 1px 发丝，不存在中间值。

玩家指示物是八个 24×24 视口内的实心多边形（圆盘、方块、三角、菱形、五边、六边、星、十字），形状与油墨色双重编码，任一单独都足以区分玩家。离线时同一形状改画成 2.4px 描边的空心版本，指示物留在桌上但不再更新。

写字板上的按键由两条轴定义：**填充**（实心＝主要、空心＝次要）与**墨色**（资源色＝属于这支资源、石墨＝通用步进）。四种组合各有其位：资源色实心＝名称块与主步进键，资源色空心＝这支资源自己的快捷行动（落在读数正下方），石墨空心＝通用的副步进键，石墨实心＝写字板之外的主行动按钮。

### Named Rules
**The Two-Axis Key Rule.** 按键的分量只由填充与墨色两条轴表达：实心比空心重，资源色说明"这属于那一支资源"，石墨说明"这是通用步进"。不靠尺寸、不靠阴影、不靠圆角再造第三条轴。

图标全部出自单一图标组件：24×24 视口、1.75 笔画、圆端圆接、`currentColor` 取色、永不填充。展开／收起用同一枚 V 形角标，收起时朝下、展开时 `rotate-180`——不换图标，只翻转。不使用 Unicode 字形、emoji 或图标字体代替图标。

## Components

### Buttons
- **Shape:** 直角矩形（0px），2px 边框，最小高度 44px，内边距 8px / 16px。
- **Solid（主行动）:** 石墨实底 + 纸色字；破坏性操作换成印刷红实底。
- **Outline（并列行动）:** 纸底 + 石墨边框与字。
- **Quiet（行内次要）:** 无边框、铅笔灰、下划线，不占按钮高度。
- **Active:** 90ms 线性反白——空框按下转石墨实底，实心压印块按下转纸底，像活字被压进纸里又抬起。没有悬停位移、没有缩放。
- **Disabled:** 纸二底 + 纸三边框 + 淡铅笔字。
- **Focus:** 全局 2px 石墨外描边，偏移 2px。

### Inputs / Fields
- **Style:** 表格里的填空位——无框、无底色，只有底下一条 1px 发丝线，字写在线上。标签是 label-cn 铅笔灰，压在线上方。
- **Focus:** 底线由 1px 发丝换成 2px 石墨，这是唯一的状态变化。不改底色、不加光晕。

### Sheets（底部抽屉 / 确认便签）
- **Style:** 从底部抽出的一联纸。顶边 2px 石墨规则线，纸色底，无圆角，遮罩是 45% 不透明的石墨。
- **Motion:** 面板 220ms 平移上滑（cubic-bezier(0.16, 1, 0.3, 1)），遮罩 180ms 淡入。不缩放、不弹跳。
- **确认便签:** 2px 石墨边框的小纸片压在页面中间，标题栏由发丝线收底，取消为 outline、确认为 solid（破坏性时取印刷红）。

### 便条（Toast）
- **Style:** 2px 边框的纸条贴在写字板上沿之外，普通为石墨、警告为印刷红并带警告图标。最多同时三张，更早的自动让位；160–180ms 淡入 + 6px 上移。

### 全桌折叠条（Score Pad Summary，签名组件）
整张纸上唯一的参照信息出口，常驻约 48px，整条本身就是展开按钮（`aria-expanded`）。纸二底、发丝线收底、末端一枚 V 形角标，展开时角标旋转 180°。三种内容形态：
- **常态：** 铅笔灰"领先" + 领先者指示物 + 名字（14px 粗体） + 40px 制表读数，右端铅笔灰"我第 N · 共 M 人"。
- **单人：** 铅笔灰一句"只有你一个人"。邀请入口不在这里 —— 它是表头栏上一枚常驻的二维码图标键，不随人数出现或消失。
- **终局：** 整条转红晕底，印刷红警示图标 + "某某的殖民地失败，本局结束"。规则层面的终局在折叠态下必须出现在这里。

### 全桌表（Score Pad）
展开后才铺开的整张表，装在一个最高 38dvh 的可滚动容器里，底边由 2px 石墨规则线收住。红色表头条套印在顶端，行＝玩家、列＝资源、最右是名次，行与行之间是发丝线，行高 46px。行首是一个双义标记位：红方块＝我那一栏（常驻），石墨方块＝此刻正在查看的那一栏；当前行另由纸三行底色标出。主资源读数 24px 加粗，其余 14px。出局者被一条 2px 印刷红横线穿过整行，"失败"标签自带纸底浮在横线上层使横线自然断开——读数本身不加删除线，2px 红线穿过字心会把 0 读成 Ø，而结算时这些数字仍然要看。出局者的名次位留空。

### 写字板（Write Pad，签名组件）
页面的主体，也是笔真正落下的地方，顶边 2px 石墨、向上投出唯一的常驻影。竖向 flex：表头行（"我的一栏" + 最近一次改动 + 撤销键）与跨资源行动条固定高，中间三个资源行等分全部剩余高度。

每个资源行是一张自足的卡片：这个数、改它的键、以及只改它的那个行动，全在一起。结构三行资源完全一致，只有颜色不同。

- **标题行**：20px 资源名压在整片资源实色上（纸白字，内边距 10px / 4px）；排行依据那一项紧跟一句铅笔灰"排行依据"。这一行只负责说明这张卡片记的是什么，不放控件。
- **操作行**：−5 −1 [读数] +1 +5，读数居中。主步进键 64px、底与边框都取该行资源色、纸白字；副步进键 52px 空心石墨框；主键在内、大步进在外，拇指从中间向外够。
- **注解行**：读数正下方一行 11px 铅笔灰，"起始 N"在前，最近几道铅笔痕跟在后面。两者都是关于这个数的注解，放在数的正下方比丢在标题行页边更好读，也不会和"采矿 +4"这类行动上的数字撞车。
- **行动行**：只作用于本资源的快捷行动，居中落在读数的正下方与它对齐——它改的就是这个数。2px 同色空心框 + 14px 同色粗体、最小 56px 高、横向内边距 24px，宽度撑到 16rem 上限后居中（多个行动并排时平分，不把行挤满）。与两侧的步进键分层：步进是"改一点"，行动是游戏里的一步，所以是空心框而不是实心键。没有行动的资源（如幸存者）不渲染这一行。

一行因此有四处同色（名称块、两枚主键、那个行动的框与字），行与行靠颜色分开，行内靠填充分主次。读数是石墨（黄联上碳墨），常规 64px、破百落到 40px。

跨资源的行动不属于任何一张卡片，留在写字板底部单独一排（2px 石墨规则线起头、48px 高、石墨框，被作用的资源名取各自的身份色）。《月球殖民地》的两个行动都各归其位，因此这一排当前不渲染。

看别人时整块纸换成 NCR 复写黄联：格线换 carbon-line、读数换碳墨、盖上一枚 −3° 倾斜的印刷红"副本"章，并且不渲染任何控件——只读不是被禁用的按钮，而是另一张纸。资源名称块在黄联上保持满饱和的资源色，它是预印上去的，不随复写变淡。

### 签名交互
写入分两笔：格内**墨迹落定**（`ink-set`，150ms，从 40% 不透明、上移 2px 落到实处——起点是可见状态，读数在任何一帧都读得出）＋格底**笔尖划痕**（`nib-stroke`，420ms 印刷红横线由左扫过后消失）。同时在读数正下方的注解行里留下一道**铅笔痕**（`pencil-in`，200ms 淡入），跟在"起始 N"后面，每个资源行留最近 3 道，不会自己消失，直到被更新的痕迹挤出；切换查看对象时清空，因为那次数值跳变不是谁写的。
所有动效在 `prefers-reduced-motion: reduce` 下降为 1ms 或直接取消。

### 浏览器自带表面
选区取印刷红底 + 纸色字，焦点环 2px 石墨，滚动条 10px、轨道纸二、滑块铅笔灰带 2px 纸二内衬（方形，无圆角），插入符石墨，`accent-color` 印刷红。这些表面也属于这套设计。

## Do's and Don'ts

### Do:
- **Do** 把剩余高度给访客此刻要做的那件事，参照信息折成固定高度的横条。
- **Do** 在折叠条上保住被折叠内容的结论（谁领先、我第几、本局是否已经结束）。
- **Do** 让同一块面板里的同类元素等高等大，差别交给材质与标注。
- **Do** 用线分隔，不用间距分隔：1px 青蓝发丝线分行，2px 石墨规则线分区。
- **Do** 让所有读数保持石墨（黄联上保持碳墨），把资源颜色留给这支资源自己的名称块、主步进键与快捷行动。
- **Do** 用行级 CSS 变量（`--key-ink`）给控件的底与边框上色，让禁用态等状态样式仍能覆盖它。
- **Do** 把只改一个数的行动放在那个数的正下方、与它对齐；跨资源的行动才下放到写字板底部单独一排。
- **Do** 给每一个状态配一个非色相记号（划线、空心、复写联、盖章、实心／空心圈、警示图标）。
- **Do** 需要更强层级时调 Archivo 的 wdth 轴和字重，不新增字号档；读数破百时降一档而不是让它溢出。
- **Do** 在每个可改的读数旁常驻"起始 N"，让人随时能系回默认值。
- **Do** 保持触控目标 ≥44px，主要操作放在下半屏。
- **Do** 新增游戏时只覆盖 paper / rule / mark 三个 CSS 变量。

### Don't:
- **Don't** 让参照性内容默认占据半屏以上；展开态也要有高度上限。
- **Don't** 把资源名缩成 11px 角标——它是那一行的标题，用 20px。
- **Don't** 用尺寸宣布哪个资源或哪个按键更重要——那是填充、墨色与标注的事。
- **Don't** 引入第三档线宽或第三档边框粗细。
- **Don't** 给任何元素加圆角。
- **Don't** 用投影表达状态变化；投影只表达"一张纸压在另一张纸上"。
- **Don't** 把资源色用在读数上；它只能是整片实色底材或实色的资源名。
- **Don't** 用内联 `style` 给按钮的底或边框上色——它会压过禁用态，让按不动的键看起来还能按。
- **Don't** 把只读表达成禁用的控件；只读是另一张纸（黄联 + 副本章 + 不渲染控件）。
- **Don't** 在读数上加删除线；出局用横穿整行的一笔。
- **Don't** 为展开／收起换一枚图标；同一枚 V 形角标旋转 180°。
- **Don't** 用 Unicode 字形、emoji 或图标字体代替图标组件里的矢量图标。
- **Don't** 给中文加大写变换或 0.14em 级的宽字距。
- **Don't** 使用弹跳、缩放、发光或模糊——运动只有平移与压印。
