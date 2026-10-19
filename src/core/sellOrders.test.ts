import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { advance } from './step'
import type { UnlockId } from './defs'
import type { GameState, Tile } from './types'

/** A new game with these Unlocks earned. */
function gameWith(opts: { unlocks?: UnlockId[] }): GameState {
  return produce(newGame(5), (d) => {
    d.unlocks = opts.unlocks ?? []
  })
}

describe('Set Sell Order', () => {
  it('fails with a reason before the Sell Orders Unlock', () => {
    const state = gameWith({})
    expect(applyAction(state, { kind: 'setSellOrder', resource: 'ore', minPrice: 0.9, reserve: 100 })).toEqual({
      ok: false,
      reason: 'fail.sellOrdersLocked',
    })
  })

  const invalid: { name: string; minPrice: number; reserve: number; reason: string }[] = [
    { name: 'a minimum price of zero', minPrice: 0, reserve: 100, reason: 'fail.invalidMinPrice' },
    { name: 'a negative Reserve', minPrice: 0.9, reserve: -1, reason: 'fail.invalidReserve' },
    { name: 'a minimum price left empty (NaN)', minPrice: NaN, reserve: 100, reason: 'fail.invalidMinPrice' },
    { name: 'a Reserve left empty (NaN)', minPrice: 0.9, reserve: NaN, reason: 'fail.invalidReserve' },
  ]
  for (const { name, minPrice, reserve, reason } of invalid) {
    it(`fails with a reason after the Unlock for ${name}`, () => {
      const state = gameWith({ unlocks: ['sellOrders'] })
      expect(applyAction(state, { kind: 'setSellOrder', resource: 'ore', minPrice, reserve })).toEqual({ ok: false, reason })
    })
  }

  it('stores a valid order after the Unlock, replacing the earlier one on that Resource', () => {
    const first = applyAction(gameWith({ unlocks: ['sellOrders'] }), { kind: 'setSellOrder', resource: 'ore', minPrice: 0.9, reserve: 100 })
    if (!first.ok) throw new Error(first.reason)
    const second = applyAction(first.value, { kind: 'setSellOrder', resource: 'ore', minPrice: 1.2, reserve: 0 })
    if (!second.ok) throw new Error(second.reason)
    expect(second.value.sellOrders).toEqual({ ore: { minPrice: 1.2, reserve: 0 }, crystal: null, alloy: null })
  })
})

/** A game holding `ore` Ore at Market Price 1, with a Sell Order on Ore set through the Player Action. */
function withOreOrder(opts: { ore: number; minPrice: number; reserve: number }): GameState {
  const state = produce(gameWith({ unlocks: ['sellOrders'] }), (d) => {
    d.storage.ore.amount = opts.ore
    d.storage.ore.tier = 5
    d.market.ore = 1
  })
  const result = applyAction(state, { kind: 'setSellOrder', resource: 'ore', minPrice: opts.minPrice, reserve: opts.reserve })
  if (!result.ok) throw new Error(result.reason)
  return result.value
}

describe('a Step with a Sell Order', () => {
  it('sells Ore down to its Reserve when the minimum price is far below the Market Price', () => {
    const after = advance(withOreOrder({ ore: 500, minPrice: 0.5, reserve: 100 }), 0.1, 0.1)
    expect({ ore: after.storage.ore.amount, priceAtOrAboveMin: after.market.ore >= 0.5 }).toEqual({ ore: 100, priceAtOrAboveMin: true })
  })

  it('stops at the minimum price, keeping more than the Reserve, when the price reaches it first', () => {
    const after = advance(withOreOrder({ ore: 500, minPrice: 0.95, reserve: 100 }), 0.1, 0.1)
    expect({ ore: after.storage.ore.amount > 100, price: after.market.ore }).toEqual({ ore: true, price: expect.closeTo(0.95, 9) })
  })

  it('never leaves the Market Price below the minimum price', () => {
    const minPrices = Array.from({ length: 50 }, (_, i) => 0.9 + i * 0.0017)
    const below = minPrices.filter((minPrice) => advance(withOreOrder({ ore: 500, minPrice, reserve: 100 }), 0.1, 0.1).market.ore < minPrice)
    expect(below).toEqual([])
  })

  it('sells nothing while the Market Price is below the minimum', () => {
    const after = advance(withOreOrder({ ore: 500, minPrice: 1.5, reserve: 100 }), 0.1, 0.1)
    expect(after.storage.ore.amount).toBe(500)
  })

  it('raises Credits and the Lifetime Counters exactly as a manual Sale of the sold amount would', () => {
    const ordered = withOreOrder({ ore: 500, minPrice: 0.95, reserve: 100 })
    const byOrder = advance(ordered, 0.1, 0.1)
    const unordered = produce(ordered, (d) => {
      d.sellOrders.ore = null
    })
    const sold = 500 - byOrder.storage.ore.amount
    const manual = applyAction(advance(unordered, 0.1, 0.1), { kind: 'sell', resource: 'ore', amount: sold })
    if (!manual.ok) throw new Error(manual.reason)
    expect({ credits: byOrder.credits, lifetime: byOrder.lifetime }).toEqual({ credits: manual.value.credits, lifetime: manual.value.lifetime })
  })

  it('sells nothing more once the Sell Order is cleared', () => {
    const cleared = applyAction(withOreOrder({ ore: 500, minPrice: 0.5, reserve: 100 }), { kind: 'clearSellOrder', resource: 'ore' })
    if (!cleared.ok) throw new Error(cleared.reason)
    expect(advance(cleared.value, 10, 0.1).storage.ore.amount).toBe(500)
  })
})

describe('Sell Orders over one hour with a Drill', () => {
  /** The Drill placed on a lone, effectively endless Ore Deposit, with a Sell Order on Ore. It barely wears, so it mines all hour. */
  function drillScenario(minPrice: number): GameState {
    const tile: Tile = { x: 15, y: 15 }
    return produce(withOreOrder({ ore: 0, minPrice, reserve: 100 }), (d) => {
      d.grid.deposits = [{ id: 'd-test', tile, resource: 'ore', remaining: 1e6 }]
      d.grid.rocks = []
      d.grid.nextDepositSpawn = 1e9
      d.machines[0]!.tile = tile
      d.machines[0]!.baseStats.durability = 1e9
    })
  }

  it('sells within 2% with 5 s Steps of what 0.1 s Steps sell', () => {
    const state = drillScenario(0.9)
    const fine = advance(state, 3600, 0.1).lifetime.sold.ore
    const coarse = advance(state, 3600, 5).lifetime.sold.ore
    expect(Math.abs(coarse - fine)).toBeLessThanOrEqual(fine * 0.02)
  })
})
