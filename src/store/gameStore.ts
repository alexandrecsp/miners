import { create } from 'zustand'
import { PACING } from '../core/defs'
import { newGame } from '../core/newGame'
import { advance } from '../core/step'
import type { GameState } from '../core/types'

export const useGameStore = create<{ game: GameState }>(() => ({
  game: newGame(Date.now()),
}))

/** Advances the Game State by whole Ticks; the Sim Loop's way to change it. */
export function runTicks(ticks: number): void {
  const { game } = useGameStore.getState()
  useGameStore.setState({ game: advance(game, ticks * PACING.tick, PACING.tick) })
}
