import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { applyAction } from './actions'
import { newGame } from './newGame'
import { replayGap, replayOffline } from './offline'
import { isTileUnlocked, machineStatus } from './queries'
import { advance } from './step'
import type { GameState, Machine } from './types'

const TILE = { x: 15, y: 15 }
const HOUR = 3600
const HOUR_MS = HOUR * 1000
const LAST_SEEN = 1_000_000

/** A game last seen at LAST_SEEN with its Drill placed on a lone Ore Deposit, edited to fit the scenario. */
function drillScenario(edit: (drill: Machine, draft: GameState) => void = () => {}): GameState {
  return produce(newGame(7), (d) => {
    d.lastSeen = LAST_SEEN
    d.grid.deposits = [{ id: 'd-test', tile: TILE, resource: 'ore', remaining: 1e9 }]
    d.grid.rocks = []
    d.grid.nextDepositSpawn = 1e9
    const drill = d.machines[0]!
    drill.tile = TILE
    drill.baseStats = { rate: 1, efficiency: 1, durability: 1 }
    edit(drill, d)
  })
}

/** Offline Replay of `seconds` after Last Seen. */
function replayAfter(state: GameState, seconds: number) {
  return replayOffline(state, state.lastSeen + seconds * 1000)
}

describe('Offline Replay of 2 hours with a placed Drill', () => {
  const cases: { name: string; edit: (drill: Machine, draft: GameState) => void }[] = [
    { name: 'that fills its Storage Cap', edit: () => {} },
    { name: 'that wears down and breaks', edit: (_m, d) => { d.storage.ore.tier = 5 } },
    {
      name: 'that wears and fills its Storage Cap before breaking',
      edit: (m, d) => {
        d.storage.ore.tier = 3
        m.baseStats.durability = 5
      },
    },
  ]
  for (const { name, edit } of cases) {
    it(`adds within 2% the Ore that Advancing 2 hours in 0.1 s Steps adds, for a Drill ${name}`, () => {
      const state = drillScenario(edit)
      const live = advance(state, 2 * HOUR, 0.1).storage.ore.amount
      const replayed = replayAfter(state, 2 * HOUR).state.storage.ore.amount
      expect(Math.abs(replayed - live)).toBeLessThanOrEqual(live * 0.02)
    })
  }
})

describe('the 8-hour cap', () => {
  it('replays exactly 8 hours of 20 and says in the Away Summary that the cap cut it', () => {
    const state = drillScenario()
    const { state: after, summary } = replayAfter(state, 20 * HOUR)
    expect({ simSeconds: after.simClock - state.simClock, seconds: summary.seconds, capped: summary.capped }).toEqual({
      simSeconds: expect.closeTo(8 * HOUR, 6),
      seconds: 8 * HOUR,
      capped: true,
    })
  })

  it('is not reported when the time away is under the cap', () => {
    const { summary } = replayAfter(drillScenario(), 2 * HOUR)
    expect({ seconds: summary.seconds, capped: summary.capped }).toEqual({ seconds: 2 * HOUR, capped: false })
  })
})

describe('a current time at or before Last Seen', () => {
  const empty = {
    seconds: 0,
    capped: false,
    mined: { ore: 0, crystal: 0 },
    refined: { ore: 0, crystal: 0, alloy: 0 },
    sold: { ore: 0, crystal: 0, alloy: 0 },
    creditsEarned: 0,
    brokenMachines: [],
    depletedDeposits: [],
    unlocks: [],
  }
  for (const { name, offset } of [{ name: 'at', offset: 0 }, { name: 'before', offset: -HOUR_MS }]) {
    it(`changes nothing and gives an empty Away Summary ${name} Last Seen`, () => {
      const state = drillScenario()
      const { state: after, summary } = replayOffline(state, state.lastSeen + offset)
      expect({ unchanged: after === state, summary }).toEqual({ unchanged: true, summary: empty })
    })
  }
})

describe('Sell Orders during Offline Replay', () => {
  /** The Drill mining into a Sell Order on Ore that sells everything at any price above 0.5. */
  function sellingScenario(): GameState {
    const state = drillScenario((m, d) => {
      m.baseStats.durability = 1e9
      d.unlocks = ['sellOrders']
    })
    const ordered = applyAction(state, { kind: 'setSellOrder', resource: 'ore', minPrice: 0.5, reserve: 0 })
    if (!ordered.ok) throw new Error(ordered.reason)
    return ordered.value
  }

  it('run, and the Away Summary reports what they sold and earned as the Lifetime Counters changed', () => {
    const state = sellingScenario()
    const { state: after, summary } = replayAfter(state, HOUR)
    expect({ sold: summary.sold.ore, creditsEarned: summary.creditsEarned, ranOrders: summary.sold.ore > 1000 }).toEqual({
      sold: after.lifetime.sold.ore - state.lifetime.sold.ore,
      creditsEarned: after.lifetime.creditsEarned - state.lifetime.creditsEarned,
      ranOrders: true,
    })
  })
})

describe('Machines and Deposits during Offline Replay', () => {
  it('lists a Machine that breaks, with its Tile, in the Away Summary, and it is Broken afterwards', () => {
    const state = drillScenario((_m, d) => { d.storage.ore.tier = 5 })
    const { state: after, summary } = replayAfter(state, HOUR)
    const drillId = state.machines[0]!.id
    expect({ broken: summary.brokenMachines, status: machineStatus(after, drillId) }).toEqual({
      broken: [{ id: drillId, defId: 'drill', tile: TILE }],
      status: { kind: 'broken' },
    })
  })

  it('does not list a Machine that was Broken already', () => {
    const state = drillScenario((m) => { m.condition = 0 })
    expect(replayAfter(state, HOUR).summary.brokenMachines).toEqual([])
  })

  it('lists a Deposit that runs out as depleted', () => {
    const state = drillScenario((m, d) => {
      m.baseStats.durability = 1e9
      d.grid.deposits[0]!.remaining = 50
    })
    expect(replayAfter(state, HOUR).summary.depletedDeposits).toEqual([{ id: 'd-test', resource: 'ore', tile: TILE }])
  })
})

describe('Unlocks during Offline Replay', () => {
  it('lists an Unlock earned, which is in effect afterwards', () => {
    const outside12 = { x: 9, y: 9 }
    const state = drillScenario((m, d) => {
      m.baseStats.durability = 1e9
      d.lifetime.mined.ore = 2990
      d.unlocks = ['storageTier2']
    })
    const { state: after, summary } = replayAfter(state, HOUR)
    expect({ unlocks: summary.unlocks, areaGrown: isTileUnlocked(after.grid, outside12) }).toEqual({
      unlocks: ['unlockedArea18'],
      areaGrown: true,
    })
  })
})

describe('determinism', () => {
  it('gives the same result twice for the same Game State and time', () => {
    const state = drillScenario()
    expect(replayAfter(state, 5 * HOUR)).toEqual(replayAfter(state, 5 * HOUR))
  })
})

describe('Offline Replay of a gap', () => {
  it('replays the gap whatever Last Seen says, as a replay from Last Seen would', () => {
    const state = drillScenario()
    expect(replayGap(state, 2 * HOUR)).toEqual(replayAfter(state, 2 * HOUR))
  })
})
