import { produce } from 'immer'
import { MAX_CONDITION } from './defs'
import { replayGap } from './offline'
import type { OfflineReplayResult } from './offline'
import { SECONDS_PER_HOUR } from './format'
import { refillShop } from './shop'
import type { GameState } from './types'

/** Cheat: adds Credits without counting them as Credits earned. */
export function addCredits(state: GameState, amount: number): GameState {
  return produce(state, (draft) => {
    draft.credits += amount
  })
}

/** Cheat: Offline Replay of `hours` hours, under the usual 8-hour cap, with its Away Summary. */
export function skipHours(state: GameState, hours: number): OfflineReplayResult {
  return replayGap(state, hours * SECONDS_PER_HOUR)
}

/** Cheat: a Shop Refresh that costs nothing. */
export function refreshShopFree(state: GameState): GameState {
  return produce(state, (draft) => {
    refillShop(draft)
  })
}

/** Cheat: sets a Machine's Condition, clamped to 0 through 100; an unknown Machine changes nothing. */
export function setCondition(state: GameState, machineId: string, condition: number): GameState {
  return produce(state, (draft) => {
    const machine = draft.machines.find((m) => m.id === machineId)
    if (machine) machine.condition = Math.min(MAX_CONDITION, Math.max(0, condition))
  })
}
