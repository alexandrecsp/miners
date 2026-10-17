import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { checkRepair, machineStatus, repairCost } from './queries'
import { advance } from './step'
import type { GameState, Machine } from './types'

const TILE = { x: 15, y: 15 }

/** A game with one placed Drill on a huge Ore Deposit and plenty of Credits. */
function scenario(edit: (machine: Machine, draft: GameState) => void = () => {}): GameState {
  return produce(newGame(11), (d) => {
    d.grid.deposits = [{ id: 'd-test', tile: TILE, resource: 'ore', remaining: 1e9 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.credits = 1000
    const drill = d.machines[0]!
    drill.tile = TILE
    drill.baseStats = { rate: 1, efficiency: 1, durability: 1 }
    edit(drill, d)
  })
}

const repair = (state: GameState, machineId = state.machines[0]!.id) => applyAction(state, { kind: 'repair', machineId })

describe('Repair cost', () => {
  it('is 18 Credits for a Drill at 40% Condition with no Lifetime Wear', () => {
    const s = scenario((m) => { m.condition = 40 })
    expect(repairCost(s.machines[0]!)).toBe(18)
  })

  it('is 27 Credits with 500 Lifetime Wear', () => {
    const s = scenario((m) => { m.condition = 40; m.lifetimeWear = 500 })
    expect(repairCost(s.machines[0]!)).toBe(27)
  })

  it('uses the Laser Miner and Refinery rates', () => {
    const s = scenario((m) => { m.defId = 'laserMiner'; m.condition = 90 })
    expect(repairCost(s.machines[0]!)).toBe(10)
    const r = scenario((m) => { m.defId = 'refinery'; m.condition = 90 })
    expect(repairCost(r.machines[0]!)).toBe(5)
  })
})

describe('Repair action', () => {
  it('restores 100% Condition, pays the cost and keeps Lifetime Wear', () => {
    const s = scenario((m) => { m.condition = 40; m.lifetimeWear = 500 })
    const result = repair(s)
    if (!result.ok) throw new Error(result.reason)
    const m = result.value.machines[0]!
    expect(m.condition).toBe(100)
    expect(m.lifetimeWear).toBe(500)
    expect(result.value.credits).toBe(1000 - 27)
  })

  it('brings a Broken Machine back to producing on the next Step', () => {
    const s = scenario((m) => { m.condition = 0; m.lifetimeWear = 100 })
    expect(machineStatus(s, s.machines[0]!.id)).toEqual({ kind: 'broken' })
    const result = repair(s)
    if (!result.ok) throw new Error(result.reason)
    const next = advance(result.value, 1, 1)
    expect(next.storage.ore.amount).toBeGreaterThan(0)
  })

  it('fails at full Condition and changes nothing', () => {
    const s = scenario()
    const result = repair(s)
    expect(result).toEqual({ ok: false, reason: 'fail.conditionFull' })
    expect(checkRepair(s, s.machines[0]!.id).ok).toBe(false)
  })

  it('fails with too few Credits', () => {
    const s = scenario((m, d) => { m.condition = 40; d.credits = 17 })
    expect(repair(s)).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
  })

  it('fails for an unknown Machine', () => {
    expect(repair(scenario(), 'nope')).toEqual({ ok: false, reason: 'fail.machineNotFound' })
  })

  it('costs more the second time after the same Wear', () => {
    let s = scenario((m) => { m.condition = 40; m.lifetimeWear = 60 })
    const first = repairCost(s.machines[0]!)
    const r1 = repair(s)
    if (!r1.ok) throw new Error(r1.reason)
    s = produce(r1.value, (d) => { d.machines[0]!.condition = 40; d.machines[0]!.lifetimeWear += 60 })
    expect(repairCost(s.machines[0]!)).toBeGreaterThan(first)
  })
})
