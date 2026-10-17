import type { Draft } from 'immer'
import { MACHINE_DEFS } from './defs'
import { effectiveStats } from './queries'
import type { Rng } from './rng'
import type { StepContext } from './stepContext'
import type { GameState } from './types'

/**
 * Wear system: each Machine that produced in this Step loses Condition at its Machine Def's wear rate
 * divided by Effective Durability, times dt, times the share of its potential output it produced.
 * Condition stops at 0%; Lifetime Wear grows by the Condition lost.
 */
export function wear(draft: Draft<GameState>, dt: number, _rng: Rng, ctx: StepContext): void {
  for (const machine of draft.machines) {
    const share = ctx.outputShares.get(machine.id)
    if (machine.tile === null || share === undefined || share <= 0) continue
    const wearPerSecond = MACHINE_DEFS[machine.defId].wearRate / effectiveStats(machine).durability
    const lost = Math.min(machine.condition, wearPerSecond * dt * share)
    machine.condition -= lost
    machine.lifetimeWear += lost
  }
}
