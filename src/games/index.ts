import { moonColonyBloodbath } from './moon-colony-bloodbath'
import { assertGameDefinition, type GameDefinition } from './types'

const definitions: readonly GameDefinition[] = [moonColonyBloodbath]
definitions.forEach(assertGameDefinition)

export const games: ReadonlyMap<string, GameDefinition> = new Map(
  definitions.map((game) => [game.id, game]),
)

export const defaultGame: GameDefinition = moonColonyBloodbath

export function getGame(id: string): GameDefinition {
  const game = games.get(id)
  if (!game) throw new Error(`未知游戏：${id}`)
  return game
}

export function initialCounters(game: GameDefinition): Record<string, number> {
  return Object.fromEntries(game.counters.map((counter) => [counter.id, counter.initial]))
}

export * from './types'
