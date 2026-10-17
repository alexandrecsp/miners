import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { effectiveStats } from './queries'
import { advance } from './step'
import type { GameState, Machine } from './types'

const TILE = { x: 15, y: 15 }

const buyMod = (modId: string): PlayerAction => ({ kind: 'buyMod', modId: modId as never })
const fitMod = (machineId: string, modId: string): PlayerAction => ({ kind: 'fitMod', machineId, modId: modId as never })

function must(state: GameState, action: PlayerAction): GameState {
  const result = applyAction(state, action)
  if (!result.ok) throw new Error(result.reason)
  return result.value
}

/** A game with one placed Drill (Rate 1, Efficiency 1, Durability 1) on a huge Ore Deposit and plenty of Credits. */
function scenario(edit: (machine: Machine, draft: GameState) => void = () => {}): GameState {
  return produce(newGame(11), (d) => {
    d.credits = 1000
    d.grid.deposits = [{ id: 'd-test', tile: TILE, resource: 'ore', remaining: 1e9 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.storage.ore.tier = 5
    const drill = d.machines[0]!
    drill.tile = TILE
    drill.baseStats = { rate: 1, efficiency: 1, durability: 1 }
    edit(drill, d)
  })
}

describe('Buy Mod action', () => {
  it('removes the price from Credits and adds one to the Mod Inventory count', () => {
    const state = scenario()
    const next = must(must(state, buyMod('overclockedMotor')), buyMod('overclockedMotor'))
    expect(next.credits).toBe(1000 - 160)
    expect(next.modInventory.overclockedMotor).toBe(2)
  })

  it('fails with too few Credits, changing nothing', () => {
    const state = scenario((_, d) => { d.credits = 79 })
    const before = structuredClone(state)
    expect(applyAction(state, buyMod('overclockedMotor'))).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
    expect(state).toEqual(before)
  })

  it('fails for an unknown Mod', () => {
    expect(applyAction(scenario(), buyMod('nope'))).toEqual({ ok: false, reason: 'fail.modNotFound' })
  })
})

describe('Fit Mod action', () => {
  it('gives a Drill of Rate 1 an Effective Rate of 1.25 with an Overclocked Motor, and 25% more Ore per Step', () => {
    const state = scenario()
    const fitted = must(must(state, buyMod('overclockedMotor')), fitMod(state.machines[0]!.id, 'overclockedMotor'))
    const machine = fitted.machines[0]!
    expect(effectiveStats(machine).rate).toBeCloseTo(1.25, 9)
    expect(fitted.modInventory.overclockedMotor).toBe(0)
    const plain = advance(state, 10, 0.1).storage.ore.amount
    const boosted = advance(fitted, 10, 0.1).storage.ore.amount
    expect(boosted / plain).toBeCloseTo(1.25, 6)
  })

  it('stacks multipliers and leaves flat bonuses unmultiplied on a Laser Miner', () => {
    const state = scenario((m) => {
      m.defId = 'laserMiner'
      m.mods = [null, null, null]
      m.baseStats = { rate: 2, efficiency: 1, durability: 1 }
    })
    const id = state.machines[0]!.id
    let s = state
    for (const mod of ['overclockedMotor', 'overclockedMotor', 'precisionBit']) s = must(must(s, buyMod(mod)), fitMod(id, mod))
    const stats = effectiveStats(s.machines[0]!)
    expect(stats.rate).toBeCloseTo(3.125, 9)
    expect(stats.efficiency).toBeCloseTo(1.2, 9)
  })

  it('works on a Machine in the Machine Inventory', () => {
    const state = scenario((m) => { m.tile = null })
    const next = must(must(state, buyMod('precisionBit')), fitMod(state.machines[0]!.id, 'precisionBit'))
    expect(effectiveStats(next.machines[0]!).efficiency).toBeCloseTo(1.2, 9)
  })

  it('fails with no free Mod Slot, changing nothing', () => {
    let s = scenario()
    const id = s.machines[0]!.id
    for (let i = 0; i < 2; i++) s = must(must(s, buyMod('precisionBit')), fitMod(id, 'precisionBit'))
    s = must(s, buyMod('precisionBit'))
    const before = structuredClone(s)
    expect(applyAction(s, fitMod(id, 'precisionBit'))).toEqual({ ok: false, reason: 'fail.noFreeModSlot' })
    expect(s).toEqual(before)
  })

  it('fails for a miner Mod on a Refinery, changing nothing', () => {
    const state = scenario((m) => { m.defId = 'refinery'; m.recipeId = 'oreToAlloy'; m.tile = null })
    const s = must(state, buyMod('precisionBit'))
    const before = structuredClone(s)
    expect(applyAction(s, fitMod(s.machines[0]!.id, 'precisionBit'))).toEqual({ ok: false, reason: 'fail.modDoesNotFit' })
    expect(s).toEqual(before)
  })

  it('fails for a Mod not in the Mod Inventory, and for an unknown Machine', () => {
    const state = scenario()
    const before = structuredClone(state)
    expect(applyAction(state, fitMod(state.machines[0]!.id, 'precisionBit'))).toEqual({ ok: false, reason: 'fail.modNotOwned' })
    expect(applyAction(state, fitMod('nope', 'precisionBit'))).toEqual({ ok: false, reason: 'fail.machineNotFound' })
    expect(state).toEqual(before)
  })
})

const removeMod = (machineId: string, slot: number): PlayerAction => ({ kind: 'removeMod', machineId, slot })

describe('Remove Mod action', () => {
  it('returns the Mod to the Mod Inventory, frees the Slot, restores the Stat, and costs nothing', () => {
    const state = scenario()
    const id = state.machines[0]!.id
    const fitted = must(must(state, buyMod('overclockedMotor')), fitMod(id, 'overclockedMotor'))
    const next = must(fitted, removeMod(id, 0))
    expect(next.modInventory.overclockedMotor).toBe(1)
    expect(next.machines[0]!.mods[0]).toBeNull()
    expect(effectiveStats(next.machines[0]!).rate).toBeCloseTo(1, 9)
    expect(next.credits).toBe(fitted.credits)
  })

  it('lets the removed Mod be fitted on a second Machine, changing its Effective Stat', () => {
    const state = scenario((_, d) => {
      const first = d.machines[0]!
      d.machines.push({ ...first, id: 'm-second', tile: null, baseStats: { ...first.baseStats }, mods: [...first.mods] })
    })
    const id = state.machines[0]!.id
    let s = must(must(state, buyMod('overclockedMotor')), fitMod(id, 'overclockedMotor'))
    s = must(must(s, removeMod(id, 0)), fitMod('m-second', 'overclockedMotor'))
    expect(effectiveStats(s.machines[1]!).rate).toBeCloseTo(1.25, 9)
    expect(effectiveStats(s.machines[0]!).rate).toBeCloseTo(1, 9)
  })

  it('fails for an empty Slot, a Slot the Machine lacks, or an unknown Machine, changing nothing', () => {
    const state = scenario()
    const id = state.machines[0]!.id
    const before = structuredClone(state)
    expect(applyAction(state, removeMod(id, 0))).toEqual({ ok: false, reason: 'fail.modSlotEmpty' })
    expect(applyAction(state, removeMod(id, 99))).toEqual({ ok: false, reason: 'fail.noSuchModSlot' })
    expect(applyAction(state, removeMod(id, -1))).toEqual({ ok: false, reason: 'fail.noSuchModSlot' })
    expect(applyAction(state, removeMod('nope', 0))).toEqual({ ok: false, reason: 'fail.machineNotFound' })
    expect(state).toEqual(before)
  })
})

describe('Reinforced Casing', () => {
  it('slows Wear by its multiplier', () => {
    const state = scenario()
    const fitted = must(must(state, buyMod('reinforcedCasing')), fitMod(state.machines[0]!.id, 'reinforcedCasing'))
    const next = advance(fitted, 10, 0.1)
    expect(next.machines[0]!.lifetimeWear).toBeCloseTo(2.5 / 1.3, 6)
  })
})
