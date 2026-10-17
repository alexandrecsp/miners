import type { Draft } from 'immer'
import { FULL_CONDITION_OUTPUT_FACTOR, recipeInputs } from './defs'
import { effectiveStats, placedMachinesInIdOrder, recipeOf, refineBatchLimit } from './queries'
import type { GameState } from './types'

/**
 * Refining system: each placed Refinery processes up to Rate x output factor x dt batches of its Recipe,
 * limited by the inputs in Storage and the room under the output's Storage Cap. Machines run in id order.
 */
export function refining(draft: Draft<GameState>, dt: number): void {
  for (const machine of placedMachinesInIdOrder(draft, 'refinery')) {
    const recipe = recipeOf(machine)
    if (!recipe) continue
    const stats = effectiveStats(machine)
    const wanted = stats.rate * FULL_CONDITION_OUTPUT_FACTOR * dt
    const batches = Math.min(wanted, refineBatchLimit(draft, recipe, stats.efficiency))
    if (!(batches > 0)) continue
    for (const [resource, perBatch] of recipeInputs(recipe)) {
      draft.storage[resource].amount -= batches * perBatch
    }
    draft.storage[recipe.output].amount += batches * recipe.outputAmount * stats.efficiency
  }
}
