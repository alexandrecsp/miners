import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { checkPlacement, machineAt, machineStatus, moveCost } from './queries'
import { tileKey as key } from './tile'
import type { GameState, Tile } from './types'


function setup() {
  const state = newGame(5)
  const drill = state.machines[0]!
  const inside = (t: Tile) => t.x >= 10 && t.x < 22 && t.y >= 10 && t.y < 22
  const oreTile = state.grid.deposits.find((d) => d.resource === 'ore' && inside(d.tile))!.tile
  const crystalTile = state.grid.deposits.find((d) => d.resource === 'crystal' && inside(d.tile))!.tile
  const rockTile = state.grid.rocks.find(inside)!
  const taken = new Set([...state.grid.deposits.map((d) => key(d.tile)), ...state.grid.rocks.map(key)])
  let emptyTile: Tile | undefined
  for (let y = 10; y < 22 && !emptyTile; y++) for (let x = 10; x < 22; x++) if (!taken.has(key({ x, y }))) { emptyTile = { x, y }; break }
  const outsideOre = state.grid.deposits.find((d) => d.resource === 'ore' && !inside(d.tile))!.tile
  return { state, drill, oreTile, crystalTile, rockTile, emptyTile: emptyTile!, outsideOre }
}

const place = (machineId: string, tile: Tile): PlayerAction => ({ kind: 'place', machineId, tile })

function failureOf(state: GameState, action: PlayerAction) {
  const result = applyAction(state, action)
  if (result.ok) throw new Error('expected failure')
  return result.reason
}

describe('Place action', () => {
  it('places the Drill on an Ore Deposit inside the Unlocked Area', () => {
    const { state, drill, oreTile } = setup()
    const result = applyAction(state, place(drill.id, oreTile))
    if (!result.ok) throw new Error(result.reason)
    const placed = result.value.machines.find((m) => m.id === drill.id)!
    expect(placed.tile).toEqual(oreTile)
    expect(result.value.machines.filter((m) => m.tile === null)).toHaveLength(0)
  })

  it('fails each wrong Tile with its own reason and leaves the state unchanged', () => {
    const { state, drill, oreTile, crystalTile, rockTile, emptyTile, outsideOre } = setup()
    const before = structuredClone(state)
    const reasons = [crystalTile, rockTile, emptyTile, outsideOre].map((t) => failureOf(state, place(drill.id, t)))
    expect(new Set(reasons).size).toBe(4)
    expect(reasons).toEqual(['fail.wrongDeposit', 'fail.tileHasRock', 'fail.noDeposit', 'fail.outsideUnlocked'])
    expect(state).toEqual(before)

    const placed = applyAction(state, place(drill.id, oreTile))
    if (!placed.ok) throw new Error('setup')
    const second = { ...structuredClone(drill), id: 'm99' }
    const withSecond = { ...placed.value, machines: [...placed.value.machines, second] }
    expect(failureOf(withSecond, place('m99', oreTile))).toBe('fail.tileOccupied')
  })

  it('fails for a Machine that is already placed or does not exist', () => {
    const { state, drill, oreTile } = setup()
    const placed = applyAction(state, place(drill.id, oreTile))
    if (!placed.ok) throw new Error('setup')
    const other = state.grid.deposits.find((d) => d.resource === 'ore' && key(d.tile) !== key(oreTile))!.tile
    expect(failureOf(placed.value, place(drill.id, other))).toBe('fail.alreadyPlaced')
    expect(failureOf(state, place('nope', oreTile))).toBe('fail.machineNotFound')
  })
})

describe('checkPlacement', () => {
  it('agrees with the Place action for every Tile of a new game', () => {
    const { state, drill } = setup()
    for (let y = 0; y < state.grid.size; y++) {
      for (let x = 0; x < state.grid.size; x++) {
        const action = place(drill.id, { x, y })
        const applied = applyAction(state, action)
        const checked = checkPlacement(state, drill.id, { x, y })
        expect(checked.ok).toBe(applied.ok)
        if (!applied.ok && !checked.ok) expect(checked.reason).toBe(applied.reason)
      }
    }
  })
})

describe('Move action', () => {
  const move = (machineId: string, tile: Tile): PlayerAction => ({ kind: 'move', machineId, tile })

  /** A placed Drill at (12, 12) with a fresh Ore Deposit 3 right and 2 down at (15, 14), and 100 Credits. */
  function placedDrill() {
    const { state, drill } = setup()
    const from = { x: 12, y: 12 }
    const to = { x: 15, y: 14 }
    const next = produce(state, (draft) => {
      draft.grid.deposits = draft.grid.deposits.filter((d) => ![from, to].some((t) => key(t) === key(d.tile)))
      draft.grid.rocks = draft.grid.rocks.filter((r) => ![from, to].some((t) => key(t) === key(r)))
      draft.grid.deposits.push({ id: 'dA', tile: from, resource: 'ore', remaining: 1 })
      draft.grid.deposits.push({ id: 'dB', tile: to, resource: 'ore', remaining: 500 })
      draft.machines.find((m) => m.id === drill.id)!.tile = { ...from }
      draft.credits = 100
    })
    return { state: next, drill, from, to }
  }

  it('moves a Drill 3 Tiles right and 2 down for 10 Credits, freeing the old Tile', () => {
    const { state, drill, from, to } = placedDrill()
    const result = applyAction(state, move(drill.id, to))
    if (!result.ok) throw new Error(result.reason)
    expect(result.value.credits).toBe(90)
    expect(result.value.machines.find((m) => m.id === drill.id)!.tile).toEqual(to)
    expect(machineAt(result.value, from)).toBeUndefined()
    expect(result.value.machines.find((m) => m.id === drill.id)!.baseStats).toEqual(drill.baseStats)
  })

  it('fails with the Placement reason for a Tile the Machine could not be placed on', () => {
    const { state, drill } = placedDrill()
    const { crystalTile, rockTile, emptyTile, outsideOre } = setup()
    for (const tile of [crystalTile, rockTile, emptyTile, outsideOre]) {
      const unplaced = produce(state, (d) => {
        d.machines.find((m) => m.id === drill.id)!.tile = null
      })
      const expected = checkPlacement(unplaced, drill.id, tile)
      if (expected.ok) throw new Error('setup')
      expect(failureOf(state, move(drill.id, tile))).toBe(expected.reason)
    }
    expect(applyAction(state, move(drill.id, rockTile)).ok).toBe(false)
  })

  it('fails with a reason for too few Credits, an unplaced Machine or the own Tile', () => {
    const { state, drill, from, to } = placedDrill()
    const poor = produce(state, (d) => {
      d.credits = 9
    })
    expect(failureOf(poor, move(drill.id, to))).toBe('fail.notEnoughCredits')
    const unplaced = produce(state, (d) => {
      d.machines.find((m) => m.id === drill.id)!.tile = null
    })
    expect(failureOf(unplaced, move(drill.id, to))).toBe('fail.notPlaced')
    expect(failureOf(state, move(drill.id, from))).toBe('fail.sameTile')
    expect(failureOf(state, move('nope', to))).toBe('fail.machineNotFound')
  })

  it('takes a Drill off a depleted spot to a fresh Deposit, from Idle to Working', () => {
    const { state, drill, from, to } = placedDrill()
    const depleted = produce(state, (d) => {
      d.grid.deposits = d.grid.deposits.filter((dep) => key(dep.tile) !== key(from))
    })
    expect(machineStatus(depleted, drill.id)).toEqual({ kind: 'idle', reason: 'noDeposit' })
    const result = applyAction(depleted, move(drill.id, to))
    if (!result.ok) throw new Error(result.reason)
    expect(machineStatus(result.value, drill.id)).toEqual({ kind: 'working' })
  })
})

describe('moveCost', () => {
  it('is the Def Move cost per Tile times the Manhattan distance, rounded up', () => {
    expect(moveCost('drill', { x: 12, y: 12 }, { x: 15, y: 14 })).toBe(10)
    expect(moveCost('laserMiner', { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(5)
    expect(moveCost('refinery', { x: 3, y: 3 }, { x: 1, y: 2 })).toBe(12)
  })
})
