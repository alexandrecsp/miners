import { describe, expect, it } from 'vitest'
import { newGame } from './newGame'
import { pace } from './pacing'
import { advance } from './step'

describe('newGame', () => {
  it('is deterministic for a seed and differs between seeds', () => {
    expect(newGame(42)).toEqual(newGame(42))
    expect(newGame(1).grid.deposits.map((d) => d.tile)).not.toEqual(newGame(2).grid.deposits.map((d) => d.tile))
  })

  it('places the counts the defs ask for, one per Tile, with the minimums in the Unlocked Area', () => {
    const { grid } = newGame(7)
    const ore = grid.deposits.filter((d) => d.resource === 'ore')
    const crystal = grid.deposits.filter((d) => d.resource === 'crystal')
    expect(grid.size).toBe(32)
    expect(grid.unlockedSize).toBe(12)
    expect(ore).toHaveLength(120)
    expect(crystal).toHaveLength(50)
    expect(grid.rocks).toHaveLength(200)
    const keys = [...grid.deposits.map((d) => d.tile), ...grid.rocks].map((t) => `${t.x},${t.y}`)
    expect(new Set(keys).size).toBe(370)
    const inside = (d: { tile: { x: number; y: number } }) => d.tile.x >= 10 && d.tile.x < 22 && d.tile.y >= 10 && d.tile.y < 22
    expect(ore.filter(inside).length).toBeGreaterThanOrEqual(6)
    expect(crystal.filter(inside).length).toBeGreaterThanOrEqual(2)
  })

  it('gives the Starting Kit: one mid-range Drill in the Machine Inventory and 50 Credits', () => {
    const state = newGame(3)
    expect(state.credits).toBe(50)
    expect(state.machines).toHaveLength(1)
    const drill = state.machines[0]!
    expect(drill.defId).toBe('drill')
    expect(drill.tile).toBeNull()
    expect(drill.condition).toBe(100)
    expect(drill.baseStats).toEqual({ rate: 1, efficiency: 1, durability: 1 })
  })

  it('survives a JSON round trip unchanged', () => {
    const state = newGame(5)
    expect(JSON.parse(JSON.stringify(state))).toEqual(state)
  })
})

describe('advance', () => {
  it('moves the sim clock by the total with 0.1 s Steps', () => {
    expect(advance(newGame(1), 1, 0.1).simClock).toBeCloseTo(1, 9)
  })
  it('moves the sim clock by the total with a shorter last 5 s Step', () => {
    expect(advance(newGame(1), 7.5, 5).simClock).toBeCloseTo(7.5, 9)
  })
})

describe('pace', () => {
  it('turns 250 ms into 2 Ticks and keeps 50 ms', () => {
    const r = pace(0, 0.25)
    expect(r.ticks).toBe(2)
    expect(r.accumulator).toBeCloseTo(0.05, 9)
    expect(r.gap).toBeNull()
  })
  it('carries the remainder across calls', () => {
    const r = pace(pace(0, 0.25).accumulator, 0.05)
    expect(r.ticks).toBe(1)
    expect(r.accumulator).toBeCloseTo(0, 9)
  })
  it('never returns more than 10 Ticks', () => {
    expect(pace(0.5, 1).ticks).toBe(10)
  })
  it('returns the whole elapsed time as a gap above 1 s', () => {
    expect(pace(0.05, 1.5)).toEqual({ ticks: 0, accumulator: 0.05, gap: 1.5 })
  })
})

describe('production Rng', () => {
  it('advances the stored generator state when New game draws from it', () => {
    expect(newGame(123).generator).not.toBe(123)
  })
  it('yields the same draws from the same stored state', () => {
    expect(newGame(999).grid.rocks).toEqual(newGame(999).grid.rocks)
  })
})
