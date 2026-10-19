import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { modLockedBy } from './queries'
import { advance } from './step'
import type { GameState } from './types'

const buyMod = (modId: string): PlayerAction => ({ kind: 'buyMod', modId: modId as never })
const fitMod = (machineId: string, modId: string): PlayerAction => ({ kind: 'fitMod', machineId, modId: modId as never })

function must(state: GameState, action: PlayerAction): GameState {
  const result = applyAction(state, action)
  if (!result.ok) throw new Error(result.reason)
  return result.value
}

/** A game with plenty of Credits and Ore, the Drill in the Machine Inventory, and a placed Refinery (Rate 1, Efficiency 1) on Ore to Alloy. */
function scenario(opts: { refineryMods: boolean }): GameState {
  return produce(newGame(11), (d) => {
    d.credits = 1000
    d.grid.deposits = []
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.storage.ore.amount = 100
    d.storage.alloy.tier = 5
    if (opts.refineryMods) d.unlocks.push('refineryMods')
    d.machines.push({
      id: 'm-ref',
      defId: 'refinery',
      baseStats: { rate: 1, efficiency: 1, durability: 1e9 },
      condition: 100,
      lifetimeWear: 0,
      mods: [null, null],
      tile: { x: 12, y: 12 },
      recipeId: 'oreToAlloy',
    })
  })
}

describe('modLockedBy', () => {
  it('names the Refinery Mods Unlock a Refinery Mod waits for before it is earned', () => {
    expect(modLockedBy(scenario({ refineryMods: false }), 'catalystBed')).toBe('refineryMods')
  })

  it('names no Unlock once the Refinery Mods Unlock is earned', () => {
    expect(modLockedBy(scenario({ refineryMods: true }), 'catalystBed')).toBeNull()
  })

  it('names no Unlock for a Mod that needs none', () => {
    expect(modLockedBy(scenario({ refineryMods: false }), 'overclockedMotor')).toBeNull()
  })
})

describe('Refinery Mods', () => {
  it('cannot be bought before the Refinery Mods Unlock, changing nothing', () => {
    const state = scenario({ refineryMods: false })
    const before = structuredClone(state)
    expect(applyAction(state, buyMod('catalystBed'))).toEqual({ ok: false, reason: 'fail.modLocked' })
    expect(state).toEqual(before)
  })

  it('can be bought after the Refinery Mods Unlock, for its price', () => {
    const next = must(scenario({ refineryMods: true }), buyMod('catalystBed'))
    expect(next.credits).toBe(1000 - 150)
    expect(next.modInventory.catalystBed).toBe(1)
  })

  it('fits a Refinery', () => {
    const owned = must(scenario({ refineryMods: true }), buyMod('catalystBed'))
    const fitted = must(owned, fitMod('m-ref', 'catalystBed'))
    expect(fitted.machines.find((m) => m.id === 'm-ref')!.mods).toEqual(['catalystBed', null])
  })

  it('does not fit a Drill', () => {
    const owned = must(scenario({ refineryMods: true }), buyMod('catalystBed'))
    expect(applyAction(owned, fitMod(owned.machines[0]!.id, 'catalystBed'))).toEqual({ ok: false, reason: 'fail.modDoesNotFit' })
  })

  it('are bought for their listed prices', () => {
    const state = scenario({ refineryMods: true })
    const prices = ['catalystBed', 'inductionCoils', 'heatShielding'].map((id) => state.credits - must(state, buyMod(id)).credits)
    expect(prices).toEqual([150, 150, 120])
  })

  it('a Catalyst Bed raises the Alloy a Refinery makes per batch by 20%', () => {
    const plain = scenario({ refineryMods: true })
    const withBed = must(must(plain, buyMod('catalystBed')), fitMod('m-ref', 'catalystBed'))
    // Rate 1 for 4 s: 4 batches of 4 Ore each; 1 Alloy per batch, 1.2 with the Catalyst Bed.
    expect(advance(plain, 4, 1).storage.alloy.amount).toBeCloseTo(4, 9)
    expect(advance(withBed, 4, 1).storage.alloy.amount).toBeCloseTo(4.8, 9)
  })
})
