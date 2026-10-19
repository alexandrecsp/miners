import { describe, expect, it } from 'vitest'
import { applyAction } from './actions'
import { MACHINE_DEFS, SHOP, STAT_NAMES } from './defs'
import { newGame } from './newGame'
import { produce } from 'immer'
import { advance, step } from './step'
import { checkShopRefresh, offerPrice, rollQuality } from './queries'
import type { GameState } from './types'

const constant = (v: number) => ({ next: () => v })
const ids = (s: GameState) => s.shop.offers.map((o) => o.machine.id)

/** A Shop Refresh forced by a scripted Rng, through the Step. */
function stockFromScripted(value: number) {
  const state = newGame(1)
  const next = produce(state, (draft) => {
    draft.shop.nextRefresh = 0
    step(draft, 0.1, constant(value))
  })
  return next.shop.offers
}

describe('Stat Roll', () => {
  it('rolls every Stat at its minimum for an Rng of 0 and near its maximum just under 1', () => {
    const low = stockFromScripted(0)
    const high = stockFromScripted(0.999999)
    for (const [offers, atMax] of [[low, false], [high, true]] as const) {
      for (const { machine } of offers) {
        for (const stat of STAT_NAMES) {
          const { min, max } = MACHINE_DEFS[machine.defId].stats[stat]
          if (atMax) {
            expect(machine.baseStats[stat]).toBeGreaterThan(max - 0.001)
            expect(machine.baseStats[stat]).toBeLessThanOrEqual(max)
          } else {
            expect(machine.baseStats[stat]).toBe(min)
          }
        }
        expect(machine.condition).toBe(100)
        expect(machine.tile).toBeNull()
      }
    }
  })

  it('keeps every rolled Stat inside its range across seeds', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const { machine } of newGame(seed).shop.offers) {
        for (const stat of STAT_NAMES) {
          const { min, max } = MACHINE_DEFS[machine.defId].stats[stat]
          expect(machine.baseStats[stat]).toBeGreaterThanOrEqual(min)
          expect(machine.baseStats[stat]).toBeLessThanOrEqual(max)
        }
      }
    }
  })

  it('has roll quality 0 at the minimums and 1 at the maximums', () => {
    expect(rollQuality({ defId: 'drill', baseStats: { rate: 0.8, efficiency: 0.8, durability: 0.8 } })).toBe(0)
    expect(rollQuality({ defId: 'drill', baseStats: { rate: 1.2, efficiency: 1.2, durability: 1.2 } })).toBeCloseTo(1)
  })
})

describe('Offer price', () => {
  it('is 70% of the base price at quality 0 and 130% at quality 1, rounded up', () => {
    expect(offerPrice('drill', 0)).toBe(42)
    expect(offerPrice('drill', 1)).toBe(78)
    expect(offerPrice('refinery', 0)).toBe(105)
    expect(offerPrice('refinery', 1)).toBe(195)
    expect(offerPrice('drill', 0.5)).toBe(60)
    expect(offerPrice('drill', 0.51)).toBe(61)
  })
})

describe('Shop Stock', () => {
  it('holds 4 Offers in a new game, with a Drill and a Refinery and no Laser Miner', () => {
    for (let seed = 0; seed < 20; seed++) {
      const defs = newGame(seed).shop.offers.map((o) => o.machine.defId)
      expect(defs).toHaveLength(4)
      expect(defs).toContain('drill')
      expect(defs).toContain('refinery')
      expect(defs).not.toContain('laserMiner')
    }
  })

  it('prices each Offer from its roll', () => {
    for (const offer of newGame(3).shop.offers) {
      const q = rollQuality(offer.machine)
      expect(offer.price).toBe(offerPrice(offer.machine.defId, q))
    }
  })

  it('replaces the Stock after 180 s and schedules the next refresh 180 s later', () => {
    const state = newGame(1)
    expect(state.shop.nextRefresh).toBe(SHOP.interval)
    const before = advance(state, 179, 1)
    expect(ids(before)).toEqual(ids(state))
    const after = advance(state, 181, 1)
    expect(after.shop.offers).toHaveLength(4)
    expect(ids(after).some((id) => ids(state).includes(id))).toBe(false)
    expect(after.shop.nextRefresh).toBe(360)
  })

  it('catches the timer up when one Step spans several intervals', () => {
    const after = advance(newGame(1), 500, 500)
    expect(after.shop.nextRefresh).toBe(540)
  })

  it('gives the same Stocks for the same seed', () => {
    expect(newGame(9).shop).toEqual(newGame(9).shop)
    expect(advance(newGame(9), 400, 1).shop).toEqual(advance(newGame(9), 400, 1).shop)
  })
})

describe('Refresh Shop action', () => {
  it('costs 20 Credits and replaces the Stock without moving the timer', () => {
    const state = { ...newGame(2), credits: 25 }
    const result = applyAction(state, { kind: 'refreshShop' })
    if (!result.ok) throw new Error(result.reason)
    expect(result.value.credits).toBe(5)
    expect(ids(result.value).some((id) => ids(state).includes(id))).toBe(false)
    expect(result.value.shop.nextRefresh).toBe(state.shop.nextRefresh)
  })

  it('fails with a reason and changes nothing under 20 Credits', () => {
    const state = { ...newGame(2), credits: 19 }
    const before = structuredClone(state)
    const result = applyAction(state, { kind: 'refreshShop' })
    expect(result).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
    expect(state).toEqual(before)
    expect(checkShopRefresh(state)).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
  })
})
