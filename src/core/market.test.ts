import { describe, expect, it } from 'vitest'
import { MARKET_DRIFT, RESOURCE_DEFS, RESOURCE_IDS } from './defs'
import type { ResourceId } from './defs'
import { newGame } from './newGame'
import { advance } from './step'
import type { GameState } from './types'

const DAY = 24 * 3600

/** Advances in chunks, returning the price samples of one Resource after every chunk. */
function samples(start: GameState, resource: ResourceId, total: number, stepLength: number, every: number): number[] {
  const out: number[] = []
  let state = start
  for (let t = 0; t < total; t += every) {
    state = advance(state, every, stepLength)
    out.push(state.market[resource])
  }
  return out
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: number[]) => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

/** Crystal prices after 10 minutes, from the given start price, over 200 seeds. */
function finalsFrom(startPrice: number): number[] {
  const finals: number[] = []
  for (let seed = 1; seed <= 200; seed++) {
    const start = newGame(seed)
    start.market.crystal = startPrice
    finals.push(advance(start, 600, 5).market.crystal)
  }
  return finals
}

describe('Market drift', () => {
  it('keeps each price near its Base Price on average and never below 20% of it over 24 sim hours', () => {
    for (const resource of RESOURCE_IDS) {
      const base = RESOURCE_DEFS[resource].basePrice
      const xs = samples(newGame(11), resource, DAY, 5, 60)
      expect(Math.abs(mean(xs) / base - 1)).toBeLessThan(0.05)
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(MARKET_DRIFT.floor * base)
    }
  })

  it('brings a price at half its Base Price back within 10% after 10 minutes on average', () => {
    const base = RESOURCE_DEFS.crystal.basePrice
    expect(Math.abs(mean(finalsFrom(base / 2)) / base - 1)).toBeLessThan(0.1)
  })

  it('brings a price above its Base Price back down the same way', () => {
    const base = RESOURCE_DEFS.crystal.basePrice
    expect(Math.abs(mean(finalsFrom(base * 1.5)) / base - 1)).toBeLessThan(0.1)
  })

  it('has a similar spread with 5 s Steps and 0.1 s Steps', { timeout: 60000 }, () => {
    const coarse = sd(samples(newGame(21), 'alloy', DAY, 5, 60))
    const fine = sd(samples(newGame(21), 'alloy', DAY, 0.1, 60))
    expect(Math.abs(coarse / fine - 1)).toBeLessThan(0.2)
  })

  it('gives the same price path for the same seed', () => {
    expect(advance(newGame(5), 3600, 1).market).toEqual(advance(newGame(5), 3600, 1).market)
    expect(advance(newGame(5), 3600, 1).market).not.toEqual(advance(newGame(6), 3600, 1).market)
  })
})
