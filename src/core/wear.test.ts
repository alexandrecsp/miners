import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { newGame } from './newGame'
import { machineStatus } from './queries'
import { advance } from './step'
import type { GameState, Machine } from './types'

const TILE = { x: 15, y: 15 }

/** A game with one placed miner on a huge Ore Deposit, Durability 1, Rate 1, Efficiency 1 and room for 7,812 Ore. */
function scenario(edit: (machine: Machine, draft: GameState) => void = () => {}): GameState {
  return produce(newGame(11), (d) => {
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

describe('Wear', () => {
  it('costs a Working Drill of Durability 1 2.5 Condition points and Lifetime Wear in 10 s', () => {
    const next = advance(scenario(), 10, 0.1)
    expect(next.machines[0]!.condition).toBeCloseTo(97.5, 6)
    expect(next.machines[0]!.lifetimeWear).toBeCloseTo(2.5, 6)
  })

  it('halves when Effective Durability doubles', () => {
    const next = advance(scenario((m) => { m.baseStats.durability = 2 }), 10, 0.1)
    expect(next.machines[0]!.lifetimeWear).toBeCloseTo(1.25, 6)
  })

  it('wears a Laser Miner at 0.8 points per second at Durability 1', () => {
    const next = advance(scenario((m) => { m.defId = 'laserMiner' }), 10, 0.1)
    expect(next.machines[0]!.lifetimeWear).toBeCloseTo(8, 6)
  })

  it('spares an Idle Machine', () => {
    const noDeposit = advance(scenario((_m, d) => { d.grid.deposits = [] }), 10, 0.1)
    expect(noDeposit.machines[0]!.condition).toBe(100)
    const full = advance(scenario((_m, d) => { d.storage.ore.amount = 7812.5 }), 10, 0.1)
    expect(full.machines[0]!.condition).toBe(100)
  })

  it('charges half the Wear for half the potential output', () => {
    const next = advance(scenario((_m, d) => { d.storage.ore.amount = 7812.5 - 0.5 }), 1, 1)
    expect(next.machines[0]!.lifetimeWear).toBeCloseTo(0.125, 6)
  })

  it('does not wear Machines in the Machine Inventory', () => {
    const next = advance(scenario((m) => { m.tile = null }), 10, 0.1)
    expect(next.machines[0]!.condition).toBe(100)
  })
})

describe('Output factor', () => {
  it('gives a Miner at 50% Condition 75% of its full-Condition yield', () => {
    const full = advance(scenario(), 1, 1)
    const worn = advance(scenario((m) => { m.condition = 50 }), 1, 1)
    expect(full.storage.ore.amount).toBeCloseTo(1, 6)
    expect(worn.storage.ore.amount).toBeCloseTo(0.75, 6)
  })
})

describe('Breaking', () => {
  it('stops Condition at exactly 0, reports Broken, yields nothing and wears no further', () => {
    const broken = advance(scenario((m) => { m.condition = 1 }), 1000, 5)
    const machine = broken.machines[0]!
    expect(machine.condition).toBe(0)
    expect(machine.lifetimeWear).toBeCloseTo(1, 6)
    expect(machineStatus(broken, machine.id)).toEqual({ kind: 'broken' })
    const later = advance(broken, 1000, 5)
    expect(later.storage.ore.amount).toBe(broken.storage.ore.amount)
    expect(later.machines[0]!.lifetimeWear).toBe(machine.lifetimeWear)
  })

  it('totals within 2% of fine Steps for output and time to break', () => {
    function run(stepLength: number): { ore: number; time: number } {
      let state = scenario()
      let time = 0
      while (state.machines[0]!.condition > 0 && time < 1000) {
        state = advance(state, stepLength, stepLength)
        time += stepLength
      }
      return { ore: state.storage.ore.amount, time }
    }
    const fine = run(0.1)
    const coarse = run(5)
    expect(Math.abs(coarse.ore - fine.ore) / fine.ore).toBeLessThan(0.02)
    expect(Math.abs(coarse.time - fine.time) / fine.time).toBeLessThan(0.02)
  })
})
