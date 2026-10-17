import { describe, expect, it } from 'vitest'
import { newGame } from './newGame'
import { isTileUnlocked, storageCap } from './queries'

describe('storageCap', () => {
  it('is the Tier 1 cap for a new game', () => {
    const state = newGame(1)
    expect(storageCap(state, 'ore')).toBe(200)
    expect(storageCap(state, 'crystal')).toBe(100)
    expect(storageCap(state, 'alloy')).toBe(100)
  })

  it('multiplies by 2.5 for each tier above 1', () => {
    const state = newGame(1)
    state.storage.ore.tier = 3
    expect(storageCap(state, 'ore')).toBe(1250)
  })
})

describe('isTileUnlocked', () => {
  it('is true only inside the central 12 x 12 Unlocked Area at the start', () => {
    const { grid } = newGame(1)
    expect(isTileUnlocked(grid, { x: 10, y: 10 })).toBe(true)
    expect(isTileUnlocked(grid, { x: 21, y: 21 })).toBe(true)
    expect(isTileUnlocked(grid, { x: 9, y: 15 })).toBe(false)
    expect(isTileUnlocked(grid, { x: 15, y: 22 })).toBe(false)
  })
})
