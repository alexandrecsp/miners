import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { advance } from './step'
import { earnedUnlocks, unlockProgress } from './queries'
import { outputFactor, UNLOCK_DEFS } from './defs'
import type { GameState, Tile } from './types'

/** A game with the Drill placed on a lone, near-indestructible Ore Deposit. */
function gameWithDrillOnOre(opts: { ore?: number } = {}): GameState {
  const tile: Tile = { x: 15, y: 15 }
  return produce(newGame(11), (d) => {
    d.grid.deposits = [{ id: 'd-test', tile, resource: 'ore', remaining: 1000 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    const drill = d.machines[0]!
    drill.tile = tile
    drill.baseStats = { rate: 1, efficiency: 1, durability: 1e9 }
    d.storage.ore.amount = opts.ore ?? 0
  })
}

describe('Lifetime Counters', () => {
  it('starts at zero', () => {
    const { lifetime } = newGame(1)
    expect(lifetime.creditsEarned).toBe(0)
    expect(lifetime.mined).toEqual({ ore: 0, crystal: 0 })
    expect(lifetime.refined).toEqual({ ore: 0, crystal: 0, alloy: 0 })
    expect(lifetime.sold).toEqual({ ore: 0, crystal: 0, alloy: 0 })
  })

  it('counts exactly the Ore mined', () => {
    const after = advance(gameWithDrillOnOre(), 10, 1)
    expect(after.lifetime.mined.ore).toBeCloseTo(10 * outputFactor(after.machines[0]!.condition), 5)
    expect(after.storage.ore.amount).toBeCloseTo(after.lifetime.mined.ore, 9)
  })

  it('counts the Alloy refined', () => {
    const state = produce(gameWithDrillOnOre({ ore: 100 }), (d) => {
      d.grid.deposits = []
      d.machines.push({
        id: 'm-ref',
        defId: 'refinery',
        baseStats: { rate: 1, efficiency: 1, durability: 1e9 },
        condition: 100,
        lifetimeWear: 0,
        mods: [null, null],
        tile: { x: 10, y: 10 },
        recipeId: 'oreToAlloy',
      })
    })
    const after = advance(state, 4, 1)
    expect(after.lifetime.refined.alloy).toBeCloseTo(4, 5) // 1 batch/s for 4 s, 1 Alloy per batch
  })

  /** A game that has sold 100 Ore, then holds plenty of Credits and a worn Drill. */
  function afterASale(): GameState {
    const state = produce(newGame(1), (d) => {
      d.storage.ore.amount = 100
    })
    const sold = applyAction(state, { kind: 'sell', resource: 'ore', amount: 100 })
    if (!sold.ok) throw new Error(sold.reason)
    return produce(sold.value, (d) => {
      d.credits = 1e6
      d.machines[0]!.condition = 50
    })
  }

  it('counts a Sale in units sold and Credits earned', () => {
    const { lifetime } = afterASale()
    expect(lifetime.sold.ore).toBe(100)
    // 1 x 2000 x (1 - e^-0.05) at the starting price of 1
    expect(lifetime.creditsEarned).toBeCloseTo(2000 * (1 - Math.exp(-0.05)), 6)
  })

  it('is never lowered by a Mod purchase, a Machine purchase, a paid Shop Refresh or a Repair', () => {
    let state = afterASale()
    const before = state.lifetime
    const actions: PlayerAction[] = [
      { kind: 'buyMod', modId: 'precisionBit' },
      { kind: 'buyOffer', machineId: state.shop.offers[0]!.machine.id },
      { kind: 'refreshShop' },
      { kind: 'repair', machineId: state.machines[0]!.id },
    ]
    for (const action of actions) {
      const result = applyAction(state, action)
      if (!result.ok) throw new Error(`${action.kind}: ${result.reason}`)
      expect(result.value.credits).toBeLessThan(state.credits)
      expect(result.value.lifetime).toEqual(before)
      state = result.value
    }
  })
})

describe('Earning Unlocks', () => {
  it('earns the Laser Miner at 600 Credits earned, once, and spending Credits does not remove it', () => {
    const below = produce(newGame(1), (d) => {
      d.lifetime.creditsEarned = 599
    })
    expect(advance(below, 1, 1).unlocks).not.toContain('laserMiner')
    const at = produce(below, (d) => {
      d.lifetime.creditsEarned = 600
    })
    const earned = advance(at, 1, 1)
    expect(earned.unlocks.filter((u) => u === 'laserMiner')).toHaveLength(1)
    const again = advance(earned, 1, 1)
    expect(again.unlocks.filter((u) => u === 'laserMiner')).toHaveLength(1)
    const spent = advance({ ...again, credits: 0 }, 1, 1)
    expect(spent.unlocks).toContain('laserMiner')
  })

  it('earns both Unlocks when a counter passes two thresholds in one Step', () => {
    const state = produce(newGame(1), (d) => {
      d.lifetime.creditsEarned = 1500
    })
    const after = advance(state, 1, 1)
    expect(after.unlocks).toContain('laserMiner')
    expect(after.unlocks).toContain('sellOrders')
  })

  it('earns Storage Tier 2 from Ore mined, through Mining itself', () => {
    const state = produce(gameWithDrillOnOre(), (d) => {
      d.lifetime.mined.ore = 299.5
    })
    expect(advance(state, 5, 1).unlocks).toContain('storageTier2')
  })
})

describe('Shop Stock and the Laser Miner', () => {
  it('holds no Laser Miner before the Unlock and at least one in every new Stock after it', () => {
    for (let seed = 0; seed < 20; seed++) {
      const before = produce(newGame(seed), (d) => {
        d.shop.nextRefresh = 0
      })
      expect(advance(before, 1, 1).shop.offers.some((o) => o.machine.defId === 'laserMiner')).toBe(false)
      const earned = advance(produce(before, (d) => {
        d.lifetime.creditsEarned = 600
        d.shop.nextRefresh = 1e9
      }), 1, 1)
      const stock = advance(produce(earned, (d) => {
        d.shop.nextRefresh = 0
      }), 1, 1).shop.offers
      expect(stock).toHaveLength(4)
      expect(stock.some((o) => o.machine.defId === 'laserMiner')).toBe(true)
    }
  })
})

describe('Unlock progress query', () => {
  it('reports each unearned Unlock with its counter value and threshold, and lists the earned ones apart', () => {
    const state = produce(newGame(1), (d) => {
      d.lifetime.creditsEarned = 700
      d.lifetime.mined.ore = 120
      d.unlocks = ['laserMiner']
    })
    expect(earnedUnlocks(state).map((def) => def.id)).toEqual(['laserMiner'])
    const progress = unlockProgress(state)
    expect(progress).toHaveLength(UNLOCK_DEFS.length - 1)
    const of = (id: string) => progress.find((p) => p.def.id === id)
    expect(of('laserMiner')).toBeUndefined()
    expect(of('storageTier2')).toMatchObject({ value: 120, def: { threshold: 300 } })
    expect(of('sellOrders')).toMatchObject({ value: 700, def: { threshold: 1500 } })
    expect(of('unlockedArea24')).toMatchObject({ value: 0, def: { threshold: 1000 } })
  })
})
