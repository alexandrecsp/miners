import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { machineStatus, nextStorageUpgrade, storageCap } from './queries'
import { advance } from './step'
import type { UnlockId } from './defs'
import type { GameState, Tile } from './types'

/** A new game with these Unlocks earned and this many Credits. */
function gameWith(opts: { unlocks?: UnlockId[]; credits?: number }): GameState {
  return produce(newGame(5), (d) => {
    d.unlocks = opts.unlocks ?? []
    d.credits = opts.credits ?? 0
  })
}

describe('Buy Storage Upgrade', () => {
  it('raises the Ore Storage Cap from 200 to 500 for 100 Credits, leaving Crystal and Alloy unchanged', () => {
    const state = gameWith({ unlocks: ['storageTier2'], credits: 100 })
    const result = applyAction(state, { kind: 'buyStorageUpgrade', resource: 'ore' })
    if (!result.ok) throw new Error(result.reason)
    const after = result.value
    expect({
      ore: storageCap(after, 'ore'),
      crystal: storageCap(after, 'crystal'),
      alloy: storageCap(after, 'alloy'),
      credits: after.credits,
    }).toEqual({ ore: 500, crystal: 100, alloy: 100, credits: 0 })
  })
})

describe('Buy Storage Upgrade failures', () => {
  const cases: { name: string; state: GameState; reason: string }[] = [
    { name: 'its Unlock is not earned', state: gameWith({ credits: 1000 }), reason: 'fail.storageTierLocked' },
    { name: 'too few Credits', state: gameWith({ unlocks: ['storageTier2'], credits: 99 }), reason: 'fail.notEnoughCredits' },
    {
      name: 'past tier 5',
      state: produce(gameWith({ credits: 1e6 }), (d) => {
        d.unlocks = ['storageTier2', 'storageTier3', 'storageTier4', 'storageTier5']
        d.storage.ore.tier = 5
      }),
      reason: 'fail.maxStorageTier',
    },
  ]
  for (const { name, state, reason } of cases) {
    it(`fails with a reason and changes nothing when ${name}`, () => {
      expect(applyAction(state, { kind: 'buyStorageUpgrade', resource: 'ore' })).toEqual({ ok: false, reason })
    })
  }
})

describe('next Storage Upgrade Query', () => {
  it('reports each tier, its cap, its cost and its Unlock as Ore climbs from tier 1 to 5', () => {
    let state = gameWith({ unlocks: ['storageTier2', 'storageTier3'], credits: 1e6 })
    const seen = []
    for (let i = 0; i < 4; i++) {
      seen.push(nextStorageUpgrade(state, 'ore'))
      state = produce(state, (d) => {
        d.storage.ore.tier += 1
      })
    }
    seen.push(nextStorageUpgrade(state, 'ore'))
    expect(seen).toEqual([
      { tier: 2, cap: 500, cost: 100, unlockId: 'storageTier2', unlocked: true },
      { tier: 3, cap: 1250, cost: 400, unlockId: 'storageTier3', unlocked: true },
      { tier: 4, cap: 3125, cost: 1500, unlockId: 'storageTier4', unlocked: false },
      { tier: 5, cap: 7812.5, cost: 6000, unlockId: 'storageTier5', unlocked: false },
      null,
    ])
  })

  it('uses the Crystal and Alloy tier 1 cap of 100', () => {
    const state = gameWith({})
    expect([nextStorageUpgrade(state, 'crystal')?.cap, nextStorageUpgrade(state, 'alloy')?.cap]).toEqual([250, 250])
  })
})

describe('a Drill Idle for Storage full', () => {
  it('works again on the Step after its Resource is upgraded', () => {
    const tile: Tile = { x: 15, y: 15 }
    const full = produce(gameWith({ unlocks: ['storageTier2'], credits: 100 }), (d) => {
      d.grid.deposits = [{ id: 'd-test', tile, resource: 'ore', remaining: 1000 }]
      d.grid.rocks = []
      d.grid.nextDepositSpawn = 1e9
      d.shop.nextRefresh = 1e9
      d.machines[0]!.tile = tile
      d.storage.ore.amount = 200
    })
    const drillId = full.machines[0]!.id
    expect(machineStatus(full, drillId)).toEqual({ kind: 'idle', reason: 'storageFull' })
    const upgraded = applyAction(full, { kind: 'buyStorageUpgrade', resource: 'ore' })
    if (!upgraded.ok) throw new Error(upgraded.reason)
    const after = advance(upgraded.value, 0.1, 0.1)
    expect(after.storage.ore.amount).toBeGreaterThan(200)
  })
})
