import type { Draft } from 'immer'
import type { DepositResource, ResourceId } from './defs'
import type { GameState } from './types'

// Every gain the Lifetime Counters track goes through here, so a gain and its counter never drift apart.

/** Adds a mined Resource to Storage and to the Lifetime Counters. */
export function addMined(draft: Draft<GameState>, resource: DepositResource, amount: number): void {
  draft.storage[resource].amount += amount
  draft.lifetime.mined[resource] += amount
}

/** Adds a refined Resource to Storage and to the Lifetime Counters. */
export function addRefined(draft: Draft<GameState>, resource: ResourceId, amount: number): void {
  draft.storage[resource].amount += amount
  draft.lifetime.refined[resource] += amount
}

/** Takes the sold amount out of Storage, pays its Credits, and adds both to the Lifetime Counters. */
export function addSale(draft: Draft<GameState>, resource: ResourceId, amount: number, credits: number): void {
  draft.storage[resource].amount -= amount
  draft.credits += credits
  draft.lifetime.sold[resource] += amount
  draft.lifetime.creditsEarned += credits
}
