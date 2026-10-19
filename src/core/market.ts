import type { Draft } from 'immer'
import { MARKET_DRIFT, RESOURCE_DEFS, RESOURCE_IDS } from './defs'
import type { ResourceId } from './defs'
import { addSale } from './lifetime'
import { saleOutcome } from './queries'
import type { Rng } from './rng'
import type { GameState } from './types'

/** A standard normal draw (Box-Muller) from the Rng. */
function normal(rng: Rng): number {
  const u = 1 - rng.next()
  const v = rng.next()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * Market drift system: each Market Price follows a mean-reverting random walk towards its Base Price,
 * using the exact discretisation for `dt`, floored at a share of the Base Price.
 */
export function marketDrift(draft: Draft<GameState>, dt: number, rng: Rng): void {
  const theta = Math.LN2 / MARKET_DRIFT.halfLife
  const decay = Math.exp(-theta * dt)
  const noise = Math.sqrt(1 - decay * decay)
  for (const resource of RESOURCE_IDS) {
    const base = RESOURCE_DEFS[resource].basePrice
    const next = base + (draft.market[resource] - base) * decay + MARKET_DRIFT.deviation * base * noise * normal(rng)
    draft.market[resource] = Math.max(next, MARKET_DRIFT.floor * base)
  }
}

/** A Sale of `amount`: takes it out of Storage, pays its Credits, and lowers the Market Price. The Sell action and Sell Orders share it. */
export function applySale(draft: Draft<GameState>, resource: ResourceId, amount: number): void {
  const { credits, price } = saleOutcome(draft, resource, amount)
  addSale(draft, resource, amount, credits)
  draft.market[resource] = price
}
