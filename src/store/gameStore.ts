import { create } from 'zustand'
import { applyAction } from '../core/actions'
import type { PlayerAction } from '../core/actions'
import { PACING } from '../core/defs'
import { newGame } from '../core/newGame'
import { replayGap } from '../core/offline'
import type { OfflineReplayResult } from '../core/offline'
import { advance } from '../core/step'
import type { GameState } from '../core/types'
import { useUiStore } from './uiStore'

/** Holds a placeholder new game until the boot sequence replaces it with the restored or new Game State. */
export const useGameStore = create<{ game: GameState }>(() => ({
  game: newGame(0),
}))

/** Replaces the whole Game State; the boot sequence's way to change it. */
export function replaceGame(game: GameState): void {
  useGameStore.setState({ game })
}

/** Advances the Game State by whole Ticks; the Sim Loop's way to change it. */
export function runTicks(ticks: number): void {
  const { game } = useGameStore.getState()
  useGameStore.setState({ game: advance(game, ticks * PACING.tick, PACING.tick) })
}

/** Hands a gap of real seconds to Offline Replay and shows its Away Summary; the Sim Loop's way to catch up after an absence. */
export function replayAway(seconds: number): void {
  applyOfflineReplay(replayGap(useGameStore.getState().game, seconds))
}

/** Puts an Offline Replay's Game State in the Game Store and shows its Away Summary; shared by the Sim Loop and the boot sequence. */
export function applyOfflineReplay({ state, summary }: OfflineReplayResult): void {
  useGameStore.setState({ game: state })
  useUiStore.getState().showAwaySummary(summary)
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
