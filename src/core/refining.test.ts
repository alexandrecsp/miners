import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { checkPlacement, inventoryMachines, machineStatus, storageCap } from './queries'
import { advance } from './step'
import type { GameState, Machine, Tile } from './types'

const TILE: Tile = { x: 15, y: 15 }

/** A plain full-Condition Machine written straight into a scenario. */
function machine(id: string, defId: 'drill' | 'refinery', stats: { rate: number; efficiency: number; durability: number }): Machine {
  return {
    id,
    defId,
    baseStats: stats,
    condition: 100,
    lifetimeWear: 0,
    mods: [null, null],
    tile: null,
    recipeId: defId === 'refinery' ? 'oreToAlloy' : null,
  }
}

/** A game with a lone Refinery (Rate, Efficiency as given) placed on an Empty Tile and the given Storage. */
function scenario(opts: { rate?: number; efficiency?: number; ore?: number; alloy?: number } = {}): GameState {
  return produce(newGame(11), (d) => {
    d.grid.deposits = []
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.machines = [
      {
        ...machine('m100', 'refinery', { rate: opts.rate ?? 0.5, efficiency: opts.efficiency ?? 1.1, durability: 1 }),
        tile: TILE,
      },
    ]
    d.storage.ore.amount = opts.ore ?? 1000
    d.storage.alloy.amount = opts.alloy ?? 0
  })
}

describe('Refinery Placement', () => {
  function inventoryRefinery(): GameState {
    return produce(scenario(), (d) => {
      d.machines[0]!.tile = null
    })
  }

  it('places on an Empty Tile', () => {
    const state = inventoryRefinery()
    const next = applyAction(state, { kind: 'place', machineId: 'm100', tile: TILE })
    expect(next.ok).toBe(true)
  })

  it('fails on a Deposit, a Rock, an occupied Tile and a Tile outside the Unlocked Area, each with a reason', () => {
    const state = produce(inventoryRefinery(), (d) => {
      d.grid.deposits = [{ id: 'd1', tile: { x: 14, y: 14 }, resource: 'ore', remaining: 100 }]
      d.grid.rocks = [{ x: 13, y: 13 }]
      d.machines.push({ ...machine('m101', 'refinery', { rate: 0.4, efficiency: 1, durability: 1 }), tile: { x: 12, y: 12 } })
    })
    expect(checkPlacement(state, 'm100', { x: 14, y: 14 })).toEqual({ ok: false, reason: 'fail.depositOnTile' })
    expect(checkPlacement(state, 'm100', { x: 13, y: 13 })).toEqual({ ok: false, reason: 'fail.tileHasRock' })
    expect(checkPlacement(state, 'm100', { x: 12, y: 12 })).toEqual({ ok: false, reason: 'fail.tileOccupied' })
    expect(checkPlacement(state, 'm100', { x: 0, y: 0 })).toEqual({ ok: false, reason: 'fail.outsideUnlocked' })
  })

  it('starts on the Ore to Alloy Recipe, in an Offer and once bought', () => {
    const state = produce(newGame(11), (d) => {
      d.credits = 10000
      d.grid.deposits = []
      d.grid.rocks = []
    })
    const offer = state.shop.offers.find((o) => o.machine.defId === 'refinery')!
    expect(offer.machine.recipeId).toBe('oreToAlloy')
    const bought = applyAction(state, { kind: 'buyOffer', machineId: offer.machine.id })
    if (!bought.ok) throw new Error(bought.reason)
    const owned = inventoryMachines(bought.value).find((m) => m.defId === 'refinery')!
    const placed = applyAction(bought.value, { kind: 'place', machineId: owned.id, tile: TILE })
    if (!placed.ok) throw new Error(placed.reason)
    expect(placed.value.machines.find((m) => m.id === owned.id)!.recipeId).toBe('oreToAlloy')
  })
})

describe('Refining', () => {
  it('uses 20 Ore and adds 5.5 Alloy for Rate 0.5, Efficiency 1.1 over 10 s', () => {
    const next = advance(scenario(), 10, 0.1)
    expect(next.storage.ore.amount).toBeCloseTo(1000 - 20, 6)
    expect(next.storage.alloy.amount).toBeCloseTo(5.5, 6)
    expect(machineStatus(next, 'm100')).toEqual({ kind: 'working' })
  })

  it('processes only the batches the Ore allows', () => {
    const next = advance(scenario({ ore: 8 }), 10, 1)
    expect(next.storage.ore.amount).toBeCloseTo(0, 6)
    expect(next.storage.alloy.amount).toBeCloseTo(2.2, 6)
  })

  it('reports Idle for inputs missing and changes nothing with no Ore', () => {
    const state = scenario({ ore: 0 })
    const next = advance(state, 10, 1)
    expect(next.storage).toEqual(state.storage)
    expect(machineStatus(next, 'm100')).toEqual({ kind: 'idle', reason: 'inputsMissing' })
  })

  it('never exceeds the Alloy Storage Cap, consumes no Ore at the cap and reports Storage full', () => {
    const state = scenario({ alloy: 99 })
    const full = advance(state, 20, 1)
    expect(full.storage.alloy.amount).toBeCloseTo(storageCap(full, 'alloy'), 6)
    const after = advance(full, 10, 1)
    expect(after.storage.ore.amount).toBeCloseTo(full.storage.ore.amount, 6)
    expect(after.storage.alloy.amount).toBeCloseTo(100, 6)
    expect(machineStatus(after, 'm100')).toEqual({ kind: 'idle', reason: 'storageFull' })
  })

  it('refines Ore mined in the same Step', () => {
    const state = produce(scenario({ ore: 0 }), (d) => {
      d.grid.deposits = [{ id: 'd1', tile: { x: 16, y: 15 }, resource: 'ore', remaining: 1000 }]
      d.machines.push({ ...machine('m101', 'drill', { rate: 4, efficiency: 1, durability: 1 }), tile: { x: 16, y: 15 } })
    })
    const next = advance(state, 1, 1)
    expect(next.storage.alloy.amount).toBeGreaterThan(0)
  })

  it('ends within 1% with 5 s Steps against 0.1 s Steps', () => {
    const fine = advance(scenario(), 100, 0.1)
    const coarse = advance(scenario(), 100, 5)
    expect(coarse.storage.alloy.amount).toBeCloseTo(fine.storage.alloy.amount, 1)
    expect(Math.abs(coarse.storage.alloy.amount - fine.storage.alloy.amount) / fine.storage.alloy.amount).toBeLessThan(0.01)
  })
})
