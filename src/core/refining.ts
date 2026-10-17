import type { Draft } from 'immer'
import { outputFactor, recipeInputs } from './defs'
import { effectiveStats, placedMachinesInIdOrder, recipeOf, refineBatchLimit } from './queries'
import type { Rng } from './rng'
import type { StepContext } from './stepContext'
import type { GameState } from './types'

/**
 * Refining system: each placed Refinery processes up to Rate x output factor x dt batches of its Recipe,
 * limited by the inputs in Storage and the room under the output's Storage Cap. Machines run in id order.
 */
export function refining(draft: Draft<GameState>, dt: number, _rng: Rng, ctx: StepContext): void {
  for (const machine of placedMachinesInIdOrder(draft, 'refinery')) {
    const recipe = recipeOf(machine)
    if (!recipe) continue
    const stats = effectiveStats(machine)
    const wanted = stats.rate * outputFactor(machine.condition) * dt
    const batches = Math.min(wanted, refineBatchLimit(draft, recipe, stats.efficiency))
    if (!(batches > 0)) continue
    ctx.outputShares.set(machine.id, batches / wanted)
    for (const [resource, perBatch] of recipeInputs(recipe)) {
      draft.storage[resource].amount -= batches * perBatch
    }
    draft.storage[recipe.output].amount += batches * recipe.outputAmount * stats.efficiency
  }
}
