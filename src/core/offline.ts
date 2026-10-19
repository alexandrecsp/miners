import { isBroken, OFFLINE } from './defs'
import type { DepositResource, ResourceId, UnlockId } from './defs'
import { advance } from './step'
import type { Deposit, GameState, Machine } from './types'

/** The Away Summary: what an Offline Replay did, found by comparing the Game State before and after. */
export interface AwaySummary {
  /** Real seconds replayed. */
  seconds: number
  /** Whether the 8-hour cap cut the time away. */
  capped: boolean
  mined: Record<DepositResource, number>
  refined: Record<ResourceId, number>
  sold: Record<ResourceId, number>
  creditsEarned: number
  /** The Machines that became Broken, with the Tile each stands on, or null when it waits in the Machine Inventory. */
  brokenMachines: Pick<Machine, 'id' | 'defId' | 'tile'>[]
  /** The Deposits that ran out, as they were before the replay apart from their remaining amount. */
  depletedDeposits: Pick<Deposit, 'id' | 'resource' | 'tile'>[]
  /** The Unlocks earned, in the order they were earned. */
  unlocks: UnlockId[]
}

export interface OfflineReplayResult {
  state: GameState
  summary: AwaySummary
}

/** Offline Replay from Last Seen to `now` (real time in milliseconds); a `now` not after Last Seen replays nothing. */
export function replayOffline(state: GameState, now: number): OfflineReplayResult {
  return replayGap(state, (now - state.lastSeen) / 1000)
}

/** Offline Replay of a gap of `away` real seconds, capped at 8 hours, in 5 s Steps inside one immer `produce`. */
export function replayGap(state: GameState, away: number): OfflineReplayResult {
  const seconds = Math.max(0, Math.min(away, OFFLINE.cap))
  const after = seconds > 0 ? advance(state, seconds, OFFLINE.stepLength) : state
  return { state: after, summary: { seconds, capped: away > OFFLINE.cap, ...summariseChanges(state, after) } }
}

/** The changes the Away Summary reports between two Game States. */
function summariseChanges(before: GameState, after: GameState): Omit<AwaySummary, 'seconds' | 'capped'> {
  const gains = <K extends string>(a: Record<K, number>, b: Record<K, number>): Record<K, number> => {
    const keys = Object.keys(a) as K[]
    return Object.fromEntries(keys.map((k) => [k, b[k] - a[k]])) as Record<K, number>
  }
  const wasBroken = new Set(before.machines.filter((m) => isBroken(m.condition)).map((m) => m.id))
  const remaining = new Set(after.grid.deposits.map((d) => d.id))
  const earned = new Set(before.unlocks)
  return {
    mined: gains(before.lifetime.mined, after.lifetime.mined),
    refined: gains(before.lifetime.refined, after.lifetime.refined),
    sold: gains(before.lifetime.sold, after.lifetime.sold),
    creditsEarned: after.lifetime.creditsEarned - before.lifetime.creditsEarned,
    brokenMachines: after.machines
      .filter((m) => isBroken(m.condition) && !wasBroken.has(m.id))
      .map(({ id, defId, tile }) => ({ id, defId, tile })),
    depletedDeposits: before.grid.deposits
      .filter((d) => !remaining.has(d.id))
      .map(({ id, resource, tile }) => ({ id, resource, tile })),
    unlocks: after.unlocks.filter((id) => !earned.has(id)),
  }
}
