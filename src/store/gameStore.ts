import { create } from 'zustand'
import { applyAction } from '../core/actions'
import type { PlayerAction } from '../core/actions'
import { PACING } from '../core/defs'
import { newGame } from '../core/newGame'
import { advance } from '../core/step'
import type { GameState } from '../core/types'
import { useUiStore } from './uiStore'

export const useGameStore = create<{ game: GameState }>(() => ({
  game: newGame(Date.now()),
}))

/** Advances the Game State by whole Ticks; the Sim Loop's way to change it. */
export function runTicks(ticks: number): void {
  const { game } = useGameStore.getState()
  useGameStore.setState({ game: advance(game, ticks * PACING.tick, PACING.tick) })
}

/** The one entry for Player Actions: applies it, or publishes the failure reason as a HUD notice. Returns whether it succeeded. */
export function dispatch(action: PlayerAction): boolean {
  const result = applyAction(useGameStore.getState().game, action)
  if (!result.ok) {
    useUiStore.getState().showFailure(result.reason)
    return false
  }
  useGameStore.setState({ game: result.value })
  return true
}
