## 项目上下文摘要（《局分》GameTally v1 方案）
生成时间：2026-09-20

### 1. 仓库现状
- `/Users/mio/My/game-tally` 为空仓（仅 .git），远端 github.com/Miot/game-tally，分支 main，无提交。
- 无既有代码可复用，项目约定由本方案首次确立（见 docs/plan-v1.md 第 3.6 节）。

### 2. 游戏事实（来源：BGG #425549、riograndegames.com、rulespal.com、geekdad.com）
- 名称 Moon Colony Bloodbath；设计 Donald X. Vaccarino；美术 Franz Vohwinkel；Rio Grande Games，2025；1–5 人；45–90 分钟；14+。
- 机制：Tableau 建造、同时行动选择、事件、牌库构筑；主题 1950s 复古未来 + 生存。
- token：人口 40×1 + 35×5、钱 40×1 + 20×5、食物 40×1 + 10×5、箱子 40×1；起始 30 人 / 4 钱 / 4 食物。
- 工作行动：Restock +2 箱子、Build 付钱建造、Mine +4 钱、Farm +4 食物、Research 抽 2 卡。
- 扣人规则：先扣垫板人口，不够则失去一栋建筑；人口归零则殖民地失败、游戏结束。
- 胜者：垫板人口 + 建筑印刷人口之和最多。无分数轨、无并列规则。
- 封面图：cf.geekdo-images.com/.../pic8638247.jpg（仅链接，不内嵌，版权归出版社）。

### 3. 技术候选（版本实测 2026-09-20）
- Trystero 0.25.4：Nostr 默认策略，另有 @trystero-p2p/mqtt、torrent、supabase、firebase、ipfs、ws-relay；支持 password、rtcConfig、turnConfig；makeAction 支持单向与 request/response；42KB。
- webConnect.js 0.0.12：Torrent/MQTT/Nostr 信令的自动 mesh；24 star；915KB；API 为 onConnect/onReceive/Send。
- Vue 3.5.43 / Vite 8.3.0 / Pinia 4.0.3 / Vue Router 5.3.1 / VueUse 15 / vite-plugin-pwa 1.3.0 / qrcode 1.5.4。

### 4. 关键风险
- WebRTC 在蜂窝网络下可能需要 TURN；公共 Nostr 中继与 Google STUN 在中国大陆不可达。
- 公共中继无 SLA；GitHub Pages 在部分网络下访问慢。
- 同步失败时需单机模式兜底。

### 5. 待用户决策
见 docs/plan-v1.md 第 1 节决策清单。
