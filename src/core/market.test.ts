import { describe, expect, it } from 'vitest'
import { MARKET_DRIFT, RESOURCE_DEFS, RESOURCE_IDS } from './defs'
import type { ResourceId } from './defs'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { saleOutcome } from './queries'
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

describe('Sell action', () => {
  const sell = (resource: ResourceId, amount: number): PlayerAction => ({ kind: 'sell', resource, amount })
  const stocked = (): GameState => {
    const s = newGame(3)
    s.storage.ore.amount = 150
    s.credits = 0
    return s
  }

  it('earns p x D x (1 - e^(-a/D)), removes the amount and leaves the price at p x e^(-a/D)', () => {
    const s = stocked()
    s.market.ore = 2
    const result = applyAction(s, sell('ore', 100))
    if (!result.ok) throw new Error(result.reason)
    // 2 * 2000 * (1 - e^(-0.05)) = 195.0823; price 2 * e^(-0.05) = 1.9024588...
    expect(result.value.credits).toBeCloseTo(195.0823, 3)
    expect(result.value.storage.ore.amount).toBe(50)
    expect(result.value.market.ore).toBeCloseTo(1.902459, 5)
    expect(saleOutcome(s, 'ore', 100).credits).toBeCloseTo(195.0823, 3)
  })

  it('earns the same for one Sale of 100 as for ten Sales of 10', () => {
    const s = stocked()
    const once = applyAction(s, sell('ore', 100))
    let split: GameState = s
    for (let i = 0; i < 10; i++) {
      const r = applyAction(split, sell('ore', 10))
      if (!r.ok) throw new Error(r.reason)
      split = r.value
    }
    if (!once.ok) throw new Error('setup')
    expect(split.credits).toBeCloseTo(once.value.credits, 6)
  })

  it('fails for more than Storage holds, zero or a negative amount, changing nothing', () => {
    const s = stocked()
    const before = structuredClone(s)
    for (const amount of [151, 0, -5]) {
      const r = applyAction(s, sell('ore', amount))
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.reason).toBe(amount > 0 ? 'fail.notEnoughResource' : 'fail.invalidAmount')
    }
    expect(s).toEqual(before)
  })

  it('lets the price recover towards its Base Price after a large Sale', () => {
    const s = stocked()
    s.storage.ore.amount = 5000
    const sold = applyAction(s, sell('ore', 5000))
    if (!sold.ok) throw new Error('setup')
    const low = sold.value.market.ore
    expect(low).toBeLessThan(0.1)
    const finals = []
    for (let seed = 1; seed <= 50; seed++) finals.push(advance({ ...sold.value, generator: seed }, 600, 5).market.ore)
    expect(mean(finals)).toBeGreaterThan(low + 0.5)
  })

  it('never sells Storage on its own while Advancing', () => {
    const s = stocked()
    const after = advance(s, 60, 5)
    expect(after.storage.ore.amount).toBe(150)
    expect(after.credits).toBe(0)
  })
})
