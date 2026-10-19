import type { Draft } from 'immer'
import { RESOURCE_IDS } from './defs'
import { applySale } from './market'
import { sellOrderAmount } from './queries'
import type { GameState } from './types'

/**
 * Sell Orders system: each Sell Order sells as much of its Resource above the Reserve as keeps the Market Price
 * at or above its minimum, through the same Sale rule as the Sell action.
 */
export function sellOrders(draft: Draft<GameState>): void {
  for (const resource of RESOURCE_IDS) {
    const order = draft.sellOrders[resource]
    if (!order) continue
    const amount = sellOrderAmount(draft, resource, order)
    if (amount <= 0) continue
    applySale(draft, resource, amount)
    // Selling exactly D x ln(p/P) can leave the price a rounding error below the minimum; never leave it there.
    draft.market[resource] = Math.max(draft.market[resource], order.minPrice)
  }
}
