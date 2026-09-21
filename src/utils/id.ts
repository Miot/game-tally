/** 生成稳定的玩家 ID；crypto.randomUUID 在所有目标浏览器（安全上下文）可用 */
export function createPlayerId(): string {
  return crypto.randomUUID()
}
