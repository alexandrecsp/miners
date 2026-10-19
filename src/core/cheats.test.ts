import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { addCredits, refreshShopFree, setCondition, skipHours } from './cheats'
import { isBroken } from './defs'
import { SECONDS_PER_HOUR } from './format'
import { newGame } from './newGame'
import { replayGap } from './offline'

describe('cheats', () => {
  it('Add Credits raises Credits by the amount', () => {
    const state = newGame(1)
    expect(addCredits(state, 500).credits).toBe(state.credits + 500)
  })

  it('Add Credits does not change Credits earned', () => {
    const state = newGame(1)
    expect(addCredits(state, 500).lifetime.creditsEarned).toBe(state.lifetime.creditsEarned)
  })

  it('Skip 3 hours gives the Game State and Away Summary of Offline Replay of 3 hours', () => {
    const state = newGame(2)
    expect(skipHours(state, 3)).toEqual(replayGap(state, 3 * SECONDS_PER_HOUR))
  })

  it('Skip 10 hours replays 8', () => {
    const state = newGame(2)
    const { state: after, summary } = skipHours(state, 10)
    expect({ simSeconds: after.simClock - state.simClock, seconds: summary.seconds }).toEqual({ simSeconds: 8 * SECONDS_PER_HOUR, seconds: 8 * SECONDS_PER_HOUR })
  })

  it('the free Shop Refresh replaces the Shop Stock', () => {
    const state = newGame(3)
    expect(refreshShopFree(state).shop.offers.map((o) => o.machine.id)).not.toEqual(state.shop.offers.map((o) => o.machine.id))
  })

  it('the free Shop Refresh does not charge Credits', () => {
    const state = newGame(3)
    expect(refreshShopFree(state).credits).toBe(state.credits)
  })

  it('setting a Machine Condition to 0 makes it Broken', () => {
    const state = newGame(4)
    const id = state.machines[0]!.id
    expect(isBroken(setCondition(state, id, 0).machines[0]!.condition)).toBe(true)
  })

  it('setting a Broken Machine Condition to 100 restores it', () => {
    const state = produce(newGame(4), (d) => {
      d.machines[0]!.condition = 0
    })
    const fixed = setCondition(state, state.machines[0]!.id, 100).machines[0]!
    expect([fixed.condition, isBroken(fixed.condition)]).toEqual([100, false])
  })

  it('clamps Condition values outside 0 to 100', () => {
    const state = newGame(4)
    const id = state.machines[0]!.id
    expect([setCondition(state, id, -20).machines[0]!.condition, setCondition(state, id, 250).machines[0]!.condition]).toEqual([0, 100])
  })

  it('leaves the Game State alone for an unknown Machine', () => {
    const state = newGame(4)
    expect(setCondition(state, 'nope', 10)).toBe(state)
  })
})
