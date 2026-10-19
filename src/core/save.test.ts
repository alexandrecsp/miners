import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import type { PlayerAction } from './actions'
import { newGame } from './newGame'
import { loadSave, serialiseSave } from './save'
import type { Migration } from './save'
import { advance } from './step'
import type { GameState } from './types'

function must(state: GameState, action: PlayerAction): GameState {
  const result = applyAction(state, action)
  if (!result.ok) throw new Error(`${action.kind}: ${result.reason}`)
  return result.value
}

/** A Game State after some play: a placed Drill with a fitted Mod, a Sell Order, earned Unlocks and an hour of Steps. */
function playedGame(): GameState {
  let state = produce(newGame(21), (d) => {
    d.credits = 2000
    d.grid.deposits[0]!.tile = { x: 15, y: 15 }
    d.unlocks = ['sellOrders']
  })
  const drillId = state.machines[0]!.id
  state = must(state, { kind: 'place', machineId: drillId, tile: { x: 15, y: 15 } })
  state = must(state, { kind: 'buyMod', modId: 'overclockedMotor' })
  state = must(state, { kind: 'fitMod', machineId: drillId, modId: 'overclockedMotor' })
  state = must(state, { kind: 'setSellOrder', resource: 'ore', minPrice: 0.9, reserve: 10 })
  return advance(state, 3600, 5)
}

/** What IndexedDB hands back: a structured clone of what was written. */
const throughStorage = (value: unknown): unknown => structuredClone(value)

describe('Save', () => {
  it('loads a serialised played Game State equal to the original, apart from Last Seen being the given time', () => {
    const state = playedGame()
    const loaded = loadSave(throughStorage(serialiseSave(state, 1_700_000_000_000)))
    expect(loaded).toEqual({ ok: true, value: { ...state, lastSeen: 1_700_000_000_000 } })
  })
})

describe('Save and the generator', () => {
  it('gives the same Shop Stock after a reload and a Shop Refresh as without the reload', () => {
    const state = playedGame()
    const loaded = loadSave(throughStorage(serialiseSave(state, 0)))
    if (!loaded.ok) throw new Error(loaded.reason)
    const refresh: PlayerAction = { kind: 'refreshShop' }
    expect(must(loaded.value, refresh).shop.offers).toEqual(must(state, refresh).shop.offers)
  })
})

describe('Save Migrations', () => {
  /** A version-1 Save, and Migrations that each add a field and leave a trace of having run. */
  const v1 = { ...serialiseSave(newGame(1), 0), saveVersion: 1, credits: 5 }
  const testMigrations: Migration[] = [
    (save) => ({ ...save, wallet: { credits: save.credits }, ran: ['1to2'] }),
    (save) => ({ ...save, ran: [...(save.ran as string[]), '2to3'] }),
  ]

  it('runs a chain of two Migrations in order and returns the shape of version 3', () => {
    expect(loadSave(v1, testMigrations)).toEqual({
      ok: true,
      value: { ...v1, saveVersion: 3, wallet: { credits: 5 }, ran: ['1to2', '2to3'] },
    })
  })

  it('loads a Save already at the current Save Version without running any Migration', () => {
    const throwing: Migration[] = [
      () => {
        throw new Error('ran 1to2')
      },
      () => {
        throw new Error('ran 2to3')
      },
    ]
    const v3 = { ...v1, saveVersion: 3 }
    expect(loadSave(v3, throwing)).toEqual({ ok: true, value: v3 })
  })
})

describe('Save load failures', () => {
  const notSaves: { name: string; raw: unknown }[] = [
    { name: 'nothing', raw: undefined },
    { name: 'null', raw: null },
    { name: 'a string', raw: 'corrupted' },
    { name: 'an array', raw: [1, 2] },
    { name: 'an object without a Save Version', raw: { credits: 5 } },
    { name: 'a Save Version that is not a whole number', raw: { saveVersion: 1.5 } },
    { name: 'a Save Version below 1', raw: { saveVersion: 0 } },
  ]
  for (const { name, raw } of notSaves) {
    it(`fails without throwing for ${name}`, () => {
      expect(loadSave(raw)).toEqual({ ok: false, reason: 'fail.notASave' })
    })
  }

  const brokenBodies: { name: string; edit: (save: Record<string, unknown>) => void }[] = [
    { name: 'no Machines', edit: (save) => { delete save.machines } },
    { name: 'a Grid without Deposits', edit: (save) => { save.grid = { size: 32, unlockedSize: 16 } } },
    { name: 'Storage missing a Resource', edit: (save) => { save.storage = {} } },
    { name: 'Credits that are not a number', edit: (save) => { save.credits = 'lots' } },
    { name: 'a Machine that is not an object', edit: (save) => { save.machines = [null] } },
  ]
  for (const { name, edit } of brokenBodies) {
    it(`fails without throwing for a current Save Version with ${name}`, () => {
      const save = structuredClone(serialiseSave(newGame(1), 0)) as unknown as Record<string, unknown>
      edit(save)
      expect(loadSave(save)).toEqual({ ok: false, reason: 'fail.notASave' })
    })
  }

  it('fails without throwing for a Save Version newer than the game knows', () => {
    expect(loadSave({ ...newGame(1), saveVersion: 2 })).toEqual({ ok: false, reason: 'fail.saveTooNew' })
  })

  it('fails without throwing when a Migration throws', () => {
    const broken: Migration[] = [
      () => {
        throw new Error('bad data')
      },
    ]
    expect(loadSave({ saveVersion: 1 }, broken)).toEqual({ ok: false, reason: 'fail.migrationFailed' })
  })
})
