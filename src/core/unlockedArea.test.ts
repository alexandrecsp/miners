import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { advance } from './step'
import { isTileUnlocked } from './queries'
import type { GameState, Tile } from './types'

/** Just outside the starting 12 × 12 Unlocked Area (Tiles 10 to 21), inside 18 × 18 (Tiles 7 to 24). */
const OUTSIDE_OLD: Tile = { x: 9, y: 15 }

/** A game with the Drill in the Machine Inventory, an Ore Deposit just outside the starting area, and `oreMined` Ore mined. */
function nearThreshold(oreMined: number): GameState {
  return produce(newGame(11), (d) => {
    d.grid.deposits = [{ id: 'd-out', tile: OUTSIDE_OLD, resource: 'ore', remaining: 1000 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.lifetime.mined.ore = oreMined
  })
}

const placeDrill = (state: GameState) => applyAction(state, { kind: 'place', machineId: state.machines[0]!.id, tile: OUTSIDE_OLD })

describe('Unlocked Area Unlocks', () => {
  it('keeps the Unlocked Area at 12 × 12 below 3,000 Ore mined', () => {
    const after = advance(nearThreshold(2999), 0.1, 0.1)
    expect(after.grid.unlockedSize).toBe(12)
  })

  it('grows the Unlocked Area to 18 × 18 on reaching 3,000 Ore mined', () => {
    const after = advance(nearThreshold(3000), 0.1, 0.1)
    expect(after.grid.unlockedSize).toBe(18)
  })

  it('lets a Deposit just outside the old area accept a Drill once the area grows', () => {
    const before = nearThreshold(3000)
    expect(placeDrill(before)).toEqual({ ok: false, reason: 'fail.outsideUnlocked' })
    expect(placeDrill(advance(before, 0.1, 0.1)).ok).toBe(true)
  })

  it('never shrinks the Unlocked Area when a smaller Unlocked Area Unlock is earned later', () => {
    // 60,000 Credits earned (32 × 32) and 3,000 Ore mined (18 × 18) in the same Step.
    const state = produce(nearThreshold(3000), (d) => {
      d.lifetime.creditsEarned = 60000
    })
    expect(advance(state, 0.1, 0.1).grid.unlockedSize).toBe(32)
  })
})

/** A game with an 18 × 18 Unlocked Area whose starting 12 × 12 centre is filled with Rocks, the spawn due at 1 s. */
function grownWithFullCentre(depositsInAddedTiles: number): GameState {
  return produce(newGame(5), (d) => {
    d.unlocks.push('unlockedArea18')
    d.grid.unlockedSize = 18
    d.grid.deposits = []
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1
    d.shop.nextRefresh = 1e9
    for (let y = 10; y < 22; y++) for (let x = 10; x < 22; x++) d.grid.rocks.push({ x, y })
    for (let i = 0; i < depositsInAddedTiles; i++) {
      d.grid.deposits.push({ id: `d${i}`, tile: { x: 7 + (i % 18), y: 7 + Math.floor(i / 18) }, resource: 'ore', remaining: 100 })
    }
  })
}

describe('Deposit spawn in a grown Unlocked Area', () => {
  it('spawns new Deposits in the added Tiles', () => {
    const state = grownWithFullCentre(0)
    const next = advance(state, 1.05, 0.05)
    expect(next.grid.deposits).toHaveLength(1)
    const tile = next.grid.deposits[0]!.tile
    expect(isTileUnlocked(next.grid, tile)).toBe(true)
    expect(isTileUnlocked({ size: 32, unlockedSize: 12 }, tile)).toBe(false)
  })

  it('spawns past the old Deposit limit of 12, up to 324 Tiles / 12 = 27', () => {
    expect(advance(grownWithFullCentre(26), 1.05, 0.05).grid.deposits).toHaveLength(27)
  })

  it('spawns nothing at the grown Deposit limit of 27', () => {
    expect(advance(grownWithFullCentre(27), 1.05, 0.05).grid.deposits).toHaveLength(27)
  })
})
