import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { checkPlacement, machineStatus, storageCap } from './queries'
import { advance } from './step'
import type { GameState, Machine, Tile } from './types'

const ORE_TILE: Tile = { x: 14, y: 15 }
const CRYSTAL_TILE: Tile = { x: 15, y: 15 }
const EMPTY_TILE: Tile = { x: 16, y: 15 }
const ROCK_TILE: Tile = { x: 17, y: 15 }

/** A Durability so high that Wear does not disturb tests of production at full Condition. */
const INDESTRUCTIBLE = 1e9

/** A plain full-Condition Machine in the Machine Inventory. */
function machine(id: string, defId: Machine['defId'], stats: Machine['baseStats']): Machine {
  return {
    id,
    defId,
    baseStats: stats,
    condition: 100,
    lifetimeWear: 0,
    mods: [null, null, null],
    tile: null,
    recipeId: defId === 'refinery' ? 'oreToAlloy' : null,
  }
}

/** A game with an Ore and a Crystal Deposit, a Rock, an Empty Tile and one Laser Miner (Rate 2, Efficiency 0.8) in the Machine Inventory. */
function scenario(edit: (draft: GameState) => void = () => {}): GameState {
  return produce(newGame(11), (d) => {
    d.grid.deposits = [
      { id: 'd-ore', tile: ORE_TILE, resource: 'ore', remaining: 1000 },
      { id: 'd-crystal', tile: CRYSTAL_TILE, resource: 'crystal', remaining: 1000 },
    ]
    d.grid.rocks = [ROCK_TILE]
    d.grid.nextDepositSpawn = 1e9
    d.shop.nextRefresh = 1e9
    d.machines = [machine('m100', 'laserMiner', { rate: 2, efficiency: 0.8, durability: INDESTRUCTIBLE })]
    edit(d)
  })
}

function placed(state: GameState, machineId: string, tile: Tile): GameState {
  const result = applyAction(state, { kind: 'place', machineId, tile })
  if (!result.ok) throw new Error(result.reason)
  return result.value
}

describe('Laser Miner Placement', () => {
  it('places on an Ore Deposit and on a Crystal Deposit', () => {
    const state = scenario()
    expect([checkPlacement(state, 'm100', ORE_TILE), checkPlacement(state, 'm100', CRYSTAL_TILE)]).toEqual([
      { ok: true, value: null },
      { ok: true, value: null },
    ])
  })

  it('fails on an Empty Tile and a Rock, each with a reason', () => {
    const state = scenario()
    expect([checkPlacement(state, 'm100', EMPTY_TILE), checkPlacement(state, 'm100', ROCK_TILE)]).toEqual([
      { ok: false, reason: 'fail.noDeposit' },
      { ok: false, reason: 'fail.tileHasRock' },
    ])
  })

  it('leaves the Drill on its Ore-only rule', () => {
    const state = scenario((d) => {
      d.machines.push(machine('m101', 'drill', { rate: 1, efficiency: 1, durability: 1 }))
    })
    expect(checkPlacement(state, 'm101', CRYSTAL_TILE)).toEqual({ ok: false, reason: 'fail.wrongDeposit' })
  })
})

describe('Laser Miner on Crystal', () => {
  it('adds Crystal to Storage', () => {
    const next = advance(placed(scenario(), 'm100', CRYSTAL_TILE), 10, 0.1)
    expect(next.storage.crystal.amount).toBeCloseTo(20, 6)
  })

  it('adds Crystal to Crystal mined', () => {
    const next = advance(placed(scenario(), 'm100', CRYSTAL_TILE), 10, 0.1)
    expect(next.lifetime.mined.crystal).toBeCloseTo(20, 6)
  })

  it('shrinks the Deposit by yield over Effective Efficiency', () => {
    const next = advance(placed(scenario(), 'm100', CRYSTAL_TILE), 10, 0.1)
    expect(next.grid.deposits.find((d) => d.id === 'd-crystal')!.remaining).toBeCloseTo(1000 - 20 / 0.8, 6)
  })

  it('reports Idle for Storage full at the Crystal Storage Cap', () => {
    const state = placed(scenario((d) => { d.storage.crystal.amount = 95 }), 'm100', CRYSTAL_TILE)
    const full = advance(state, 10, 1)
    expect([full.storage.crystal.amount, machineStatus(full, 'm100')]).toEqual([storageCap(full, 'crystal'), { kind: 'idle', reason: 'storageFull' }])
  })

  it('leaves a Laser Miner on Ore Working while Crystal Storage is full', () => {
    const state = produce(placed(scenario((d) => { d.storage.crystal.amount = 100 }), 'm100', CRYSTAL_TILE), (d) => {
      d.machines.push({ ...machine('m101', 'laserMiner', { rate: 2, efficiency: 1, durability: INDESTRUCTIBLE }), tile: ORE_TILE })
    })
    const next = advance(state, 10, 1)
    expect([next.storage.ore.amount > 19.99, machineStatus(next, 'm101')]).toEqual([true, { kind: 'working' }])
  })
})

describe('Laser Miner Wear', () => {
  it('wears faster than a Drill of equal Durability', () => {
    const state = produce(scenario(), (d) => {
      d.machines = [
        { ...machine('m100', 'laserMiner', { rate: 1, efficiency: 1, durability: 1 }), tile: CRYSTAL_TILE },
        { ...machine('m101', 'drill', { rate: 1, efficiency: 1, durability: 1 }), tile: ORE_TILE },
      ]
    })
    const next = advance(state, 10, 0.1)
    const [laser, drill] = next.machines
    expect(laser!.lifetimeWear).toBeGreaterThan(drill!.lifetimeWear)
  })
})

describe('Refining mined Crystal', () => {
  it('produces Alloy from Ore and Crystal on the Ore plus Crystal Recipe', () => {
    const state = produce(placed(scenario(), 'm100', CRYSTAL_TILE), (d) => {
      d.storage.ore.amount = 100
      d.machines.push({ ...machine('m101', 'refinery', { rate: 0.5, efficiency: 1, durability: INDESTRUCTIBLE }), recipeId: 'oreCrystalToAlloy', tile: EMPTY_TILE })
    })
    const next = advance(state, 10, 0.1)
    expect([next.storage.alloy.amount > 0, next.storage.ore.amount < 100, next.lifetime.refined.alloy > 0]).toEqual([true, true, true])
  })
})
