import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { newGame } from './newGame'
import { effectiveStat } from './stats'
import { effectiveStats, machineStatus, storageCap } from './queries'
import { advance } from './step'
import type { GameState, Tile } from './types'

describe('effectiveStat', () => {
  it('is base times the product of multipliers plus the sum of flat bonuses', () => {
    expect(effectiveStat(2, [1.5, 2], [1, 0.5])).toBe(7.5)
  })
  it('returns the base with no Mods', () => {
    expect(effectiveStat(2, [], [])).toBe(2)
  })
})

/** A game with the Drill placed on a lone Ore Deposit of the given size. */
function scenario(opts: { remaining?: number; rate?: number; efficiency?: number; ore?: number } = {}): {
  state: GameState
  tile: Tile
} {
  const base = newGame(11)
  const tile = { x: 15, y: 15 }
  const state = produce(base, (d) => {
    d.grid.deposits = [{ id: 'd-test', tile, resource: 'ore', remaining: opts.remaining ?? 1000 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    const drill = d.machines[0]!
    drill.tile = tile
    drill.baseStats.rate = opts.rate ?? 1
    drill.baseStats.efficiency = opts.efficiency ?? 0.8
    d.storage.ore.amount = opts.ore ?? 0
  })
  return { state, tile }
}

describe('effectiveStats query', () => {
  it('returns the Base Stats while no Mods exist', () => {
    const { state } = scenario({ efficiency: 0.8 })
    expect(effectiveStats(state.machines[0]!)).toEqual({ rate: 1, efficiency: 0.8, durability: 1 })
  })
})

describe('Mining', () => {
  it('adds Ore to Storage and shrinks the Deposit by yield over Efficiency', () => {
    const { state } = scenario({ remaining: 1000 })
    const next = advance(state, 10, 0.1)
    expect(next.storage.ore.amount).toBeCloseTo(10, 6)
    expect(next.grid.deposits[0]!.remaining).toBeCloseTo(987.5, 6)
    expect(machineStatus(next, next.machines[0]!.id)).toEqual({ kind: 'working' })
  })

  it('gives only what a nearly empty Deposit holds times Efficiency, removes it, then idles', () => {
    const { state } = scenario({ remaining: 5 })
    const drained = advance(state, 10, 10)
    expect(drained.storage.ore.amount).toBeCloseTo(4, 6)
    expect(drained.grid.deposits).toHaveLength(0)
    const after = advance(drained, 1, 1)
    expect(after.storage.ore.amount).toBeCloseTo(4, 6)
    expect(machineStatus(after, after.machines[0]!.id)).toEqual({ kind: 'idle', reason: 'noDeposit' })
  })

  it('never exceeds the Ore Storage Cap, uses no Deposit at the cap and reports Storage full', () => {
    const { state } = scenario({ ore: 195 })
    const full = advance(state, 10, 1)
    expect(full.storage.ore.amount).toBeCloseTo(storageCap(full, 'ore'), 6)
    const depositAtCap = full.grid.deposits[0]!.remaining
    const after = advance(full, 5, 1)
    expect(after.storage.ore.amount).toBeCloseTo(200, 6)
    expect(after.grid.deposits[0]!.remaining).toBe(depositAtCap)
    expect(machineStatus(after, after.machines[0]!.id)).toEqual({ kind: 'idle', reason: 'storageFull' })
  })

  it('splits the last room under the cap between two Drills in id order', () => {
    const { state } = scenario({ ore: 199.5 })
    const first = state.machines[0]!
    const two = produce(state, (d) => {
      const tile2 = { x: 16, y: 15 }
      d.grid.deposits.push({ id: 'd-test2', tile: tile2, resource: 'ore', remaining: 1000 })
      d.machines.push({ ...JSON.parse(JSON.stringify(first)), id: 'm999', tile: tile2 })
    })
    const next = advance(two, 1, 1)
    expect(next.storage.ore.amount).toBeCloseTo(200, 6)
    expect(next.grid.deposits.find((x) => x.id === 'd-test')!.remaining).toBeCloseTo(1000 - 0.5 / 0.8, 6)
    expect(next.grid.deposits.find((x) => x.id === 'd-test2')!.remaining).toBe(1000)
    expect(advance(two, 1, 1)).toEqual(next)
  })

  it('gives nearly the same result with 5 s Steps as with 0.1 s Steps', () => {
    const { state } = scenario({ remaining: 60 })
    const fine = advance(state, 100, 0.1)
    const coarse = advance(state, 100, 5)
    expect(coarse.storage.ore.amount).toBeGreaterThan(0)
    expect(Math.abs(coarse.storage.ore.amount - fine.storage.ore.amount)).toBeLessThanOrEqual(fine.storage.ore.amount * 0.01)
  })

  it('evaluates Machines by id counter, so m2 runs before m10', () => {
    const { state } = scenario({ ore: 199.5 })
    const first = state.machines[0]!
    const two = produce(state, (d) => {
      const tile2 = { x: 16, y: 15 }
      d.grid.deposits.push({ id: 'd-test2', tile: tile2, resource: 'ore', remaining: 1000 })
      d.machines[0]!.id = 'm10'
      d.machines.unshift({ ...JSON.parse(JSON.stringify(first)), id: 'm2', tile: tile2 })
    })
    const next = advance(two, 1, 1)
    expect(next.grid.deposits.find((x) => x.id === 'd-test2')!.remaining).toBeCloseTo(1000 - 0.5 / 0.8, 6)
    expect(next.grid.deposits.find((x) => x.id === 'd-test')!.remaining).toBe(1000)
  })

  it('gives nearly the same result with 5 s Steps as with 0.1 s Steps when the Storage Cap limits it', () => {
    const { state } = scenario({ ore: 150 })
    const fine = advance(state, 100, 0.1)
    const coarse = advance(state, 100, 5)
    expect(fine.storage.ore.amount).toBeCloseTo(200, 6)
    expect(coarse.storage.ore.amount).toBeCloseTo(200, 6)
  })

  it('gives nearly the same result with 5 s Steps as with 0.1 s Steps in steady mining', () => {
    const { state } = scenario({ remaining: 1000 })
    const fine = advance(state, 100, 0.1)
    const coarse = advance(state, 100, 5)
    expect(Math.abs(coarse.grid.deposits[0]!.remaining - fine.grid.deposits[0]!.remaining)).toBeLessThanOrEqual(10)
  })

  it('reports an unplaced Drill as not placed', () => {
    const state = newGame(2)
    expect(machineStatus(state, state.machines[0]!.id)).toEqual({ kind: 'inventory' })
  })
})
