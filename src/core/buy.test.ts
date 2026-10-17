import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { advance } from './step'
import { checkBuyOffer, checkPlacement, inventoryMachines } from './queries'
import type { GameState, Offer } from './types'

const buy = (machineId: string): PlayerAction => ({ kind: 'buyOffer', machineId })

function rich(credits = 10000): GameState {
  return produce(newGame(3), (d) => {
    d.credits = credits
  })
}

const offerOf = (state: GameState, defId: string): Offer => state.shop.offers.find((o) => o.machine.defId === defId)!

function bought(state: GameState, machineId: string): GameState {
  const result = applyAction(state, buy(machineId))
  if (!result.ok) throw new Error(result.reason)
  return result.value
}

describe('Buy Offer action', () => {
  it('pays the price, adds the exact rolled Machine at 100% Condition and removes the Offer', () => {
    const state = rich(1000)
    const offer = offerOf(state, 'drill')
    const next = bought(state, offer.machine.id)
    expect(next.credits).toBe(1000 - offer.price)
    expect(next.shop.offers).toHaveLength(state.shop.offers.length - 1)
    expect(next.shop.offers.some((o) => o.machine.id === offer.machine.id)).toBe(false)
    const added = inventoryMachines(next).find((m) => m.defId === 'drill' && m.id !== state.machines[0]!.id)!
    expect(added.baseStats).toEqual(offer.machine.baseStats)
    expect(added.condition).toBe(100)
    expect(added.tile).toBeNull()
  })

  it('fails with too few Credits, and for an unknown Offer, changing nothing', () => {
    const state = rich(1)
    const before = structuredClone(state)
    const offer = state.shop.offers[0]!
    const poor = applyAction(state, buy(offer.machine.id))
    expect(poor).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
    const missing = applyAction(state, buy('nope'))
    expect(missing).toEqual({ ok: false, reason: 'fail.offerNotFound' })
    expect(state).toEqual(before)
    expect(checkBuyOffer(state, offer.machine.id)).toEqual({ ok: false, reason: 'fail.notEnoughCredits' })
  })

  it('gives two bought Machines different ids', () => {
    const state = rich()
    const [a, b] = state.shop.offers
    const next = bought(bought(state, a!.machine.id), b!.machine.id)
    const ids = next.machines.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(3)
  })

  it('lets a bought Drill be placed on an Ore Deposit and mine', () => {
    const start = rich()
    let state = bought(start, offerOf(start, 'drill').machine.id)
    const drill = inventoryMachines(state).find((m) => m.id !== start.machines[0]!.id && m.defId === 'drill')!
    const tile = { x: 15, y: 15 }
    state = produce(state, (d) => {
      d.grid.deposits = [{ id: 'd-test', tile, resource: 'ore', remaining: 1000 }]
      d.grid.rocks = []
      d.grid.nextDepositSpawn = 1e9
      d.shop.nextRefresh = 1e9
      d.storage.ore.amount = 0
    })
    const placed = applyAction(state, { kind: 'place', machineId: drill.id, tile })
    if (!placed.ok) throw new Error(placed.reason)
    const later = advance(placed.value, 10, 0.1)
    expect(later.storage.ore.amount).toBeGreaterThan(0)
  })

  it('leaves a bought Refinery in the Machine Inventory and rejects every Tile for it', () => {
    const state = rich()
    const next = bought(state, offerOf(state, 'refinery').machine.id)
    const refinery = inventoryMachines(next).find((m) => m.defId === 'refinery')!
    expect(refinery).toBeDefined()
    for (let y = 0; y < next.grid.size; y++) {
      for (let x = 0; x < next.grid.size; x++) {
        const check = checkPlacement(next, refinery.id, { x, y })
        expect(check.ok).toBe(false)
      }
    }
    expect(checkPlacement(next, refinery.id, { x: 15, y: 15 })).toEqual({ ok: false, reason: 'fail.placementNotAvailable' })
  })
})
