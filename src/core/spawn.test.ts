import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { newGame } from './newGame'
import { advance, step } from './step'
import { DEPOSIT_DEFS } from './defs'
import { isTileUnlocked } from './queries'
import type { Rng } from './rng'
import type { GameState, Tile } from './types'

/** Market drift draws two numbers per Resource at the start of a Step, before Deposit spawn. */
const MARKET_DRAWS = 6

/** An Rng that returns the given draws in order (after the Market drift's), then 0.5 forever. */
function scripted(spawnDraws: number[]): Rng {
  const draws = [...Array<number>(MARKET_DRAWS).fill(0.5), ...spawnDraws]
  let i = 0
  return { next: () => (i < draws.length ? draws[i++]! : 0.5) }
}

function stepWith(state: GameState, dt: number, rng: Rng): GameState {
  return produce(state, (d) => step(d, dt, rng))
}

/** A game with an empty Grid, the spawn due at 10 s, and the Drill in the Machine Inventory. */
function emptyGrid(): GameState {
  return produce(newGame(5), (d) => {
    d.grid.deposits = []
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 10
  })
}

/** A new game thinned to 3 Deposits in the Unlocked Area, so the Deposit limit is not reached. */
function roomy(seed: number, spawnAt: number): GameState {
  return produce(newGame(seed), (d) => {
    let inside = 0
    d.grid.deposits = d.grid.deposits.filter((x) => !isTileUnlocked(d.grid, x.tile) || inside++ < 3)
    d.grid.nextDepositSpawn = spawnAt
  })
}

const key = (t: Tile) => `${t.x},${t.y}`

describe('Deposit spawn', () => {
  it('sets the first spawn time in New game', () => {
    expect(newGame(8).grid.nextDepositSpawn).toBeGreaterThan(0)
  })

  it('adds exactly one Deposit on an Empty Tile inside the Unlocked Area and sets a later spawn time', () => {
    const state = roomy(5, 10)
    const before = state.grid.deposits.length
    const next = advance(state, 10.05, 0.05)
    expect(next.grid.deposits).toHaveLength(before + 1)
    const added = next.grid.deposits[before]!
    expect(isTileUnlocked(next.grid, added.tile)).toBe(true)
    const range = DEPOSIT_DEFS[added.resource].amount
    expect(added.remaining).toBeGreaterThanOrEqual(range.min)
    expect(added.remaining).toBeLessThanOrEqual(range.max)
    expect(next.grid.nextDepositSpawn).toBeGreaterThan(10)
  })

  it('never lands on a Rock, a Deposit or outside the Unlocked Area', () => {
    // Only (13,13) stays free in the Unlocked Area: 11 Deposits (under the limit), the rest Rocks.
    const state = produce(newGame(5), (d) => {
      d.grid.deposits = []
      d.grid.rocks = []
      d.grid.nextDepositSpawn = 1
      for (let y = 10; y < 22; y++) {
        for (let x = 10; x < 22; x++) {
          if (x === 13 && y === 13) continue
          if (d.grid.deposits.length < 11) d.grid.deposits.push({ id: `d-${x}-${y}`, tile: { x, y }, resource: 'ore', remaining: 1 })
          else d.grid.rocks.push({ x, y })
        }
      }
    })
    for (const draw of [0, 0.5, 0.999]) {
      const next = stepWith(state, 2, scripted([0.1, draw, 0.5, 0.5]))
      expect(next.grid.deposits).toHaveLength(12)
      expect(next.grid.deposits[11]!.tile).toEqual({ x: 13, y: 13 })
    }
  })

  it('does not land on a Tile with a Machine', () => {
    const state = produce(emptyGrid(), (d) => {
      d.grid.nextDepositSpawn = 1
      d.machines[0]!.defId = 'refinery'
      d.machines[0]!.recipeId = 'oreToAlloy'
      d.machines[0]!.tile = { x: 10, y: 10 }
    })
    // Index 0 of the Empty Tiles would be (10,10) if Machines were ignored.
    const next = stepWith(state, 2, scripted([0.1, 0, 0.5, 0.5]))
    expect(next.grid.deposits).toHaveLength(1)
    expect(next.grid.deposits[0]!.tile).toEqual({ x: 11, y: 10 })
  })

  it('adds no Deposit at the Deposit limit, but still draws the next spawn time', () => {
    const state = produce(emptyGrid(), (d) => {
      d.grid.nextDepositSpawn = 1
      // 144 Tiles / 12 = 12 Deposits is the limit.
      for (let i = 0; i < 12; i++) d.grid.deposits.push({ id: `d${i}`, tile: { x: 10 + i, y: 10 }, resource: 'ore', remaining: 100 })
    })
    const next = stepWith(state, 2, scripted([0.1, 0.5, 0.5, 0.5]))
    expect(next.grid.deposits).toHaveLength(12)
    expect(next.grid.nextDepositSpawn).toBeGreaterThan(2)
  })

  it('spawns a Crystal Deposit for a high draw and an Ore Deposit for a low draw', () => {
    const state = emptyGrid()
    const crystal = stepWith(state, 11, scripted([0.9, 0.5, 0.5, 0.5]))
    const ore = stepWith(state, 11, scripted([0.1, 0.5, 0.5, 0.5]))
    expect(crystal.grid.deposits.map((d) => d.resource)).toEqual(['crystal'])
    expect(ore.grid.deposits.map((d) => d.resource)).toEqual(['ore'])
  })

  it('gives equal Deposit sets for the same seed after one hour', () => {
    const a = advance(newGame(21), 3600, 5)
    const b = advance(newGame(21), 3600, 5)
    expect(a.grid.deposits).toEqual(b.grid.deposits)
    expect(a.grid.deposits.length).toBeGreaterThan(newGame(21).grid.deposits.length - 1)
  })

  it('spawns in one 5 s Step as 0.1 s Steps do', () => {
    const state = roomy(9, 2)
    const constant = scripted([])
    const fine = produce(state, (d) => {
      for (let i = 0; i < 50; i++) step(d, 0.1, constant)
    })
    const coarse = stepWith(state, 5, constant)
    expect(coarse.grid.deposits).toHaveLength(state.grid.deposits.length + 1)
    expect(coarse.grid.deposits).toEqual(fine.grid.deposits)
    expect(coarse.grid.nextDepositSpawn).toBeCloseTo(fine.grid.nextDepositSpawn, 6)
  })

  it('spawns one Deposit for each spawn time a Step passes', () => {
    // Draws per spawn: kind, tile, amount, interval (next spawn 1 s later).
    const rng = scripted([0.1, 0, 0.5, 0.03, 0.1, 0, 0.5, 0.03, 0.1, 0, 0.5, 0.9])
    const next = stepWith(emptyGrid(), 12.5, rng)
    expect(next.grid.deposits).toHaveLength(3)
    expect(new Set(next.grid.deposits.map((d) => key(d.tile))).size).toBe(3)
  })
})
