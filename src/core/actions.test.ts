import { describe, expect, it } from 'vitest'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { checkPlacement } from './queries'
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
