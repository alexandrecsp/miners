import { produce } from 'immer'
import type { Draft } from 'immer'
import { marketDrift } from './market'
import { mining } from './mining'
import { depositSpawn } from './spawn'
import { stateRng } from './rng'
import type { Rng } from './rng'
import type { GameState } from './types'

type System = (draft: Draft<GameState>, dt: number, rng: Rng) => void

function clock(draft: Draft<GameState>, dt: number): void {
  draft.simClock += dt
}

/** The Step's systems, in the order they run. */
const PIPELINE: readonly System[] = [clock, marketDrift, depositSpawn, mining]

export function step(draft: Draft<GameState>, dt: number, rng: Rng): void {
  for (const system of PIPELINE) system(draft, dt, rng)
}

/** Runs as many Steps of `stepLength` as fit in `total`, the last one shorter, in one produce. */
export function advance(state: GameState, total: number, stepLength: number): GameState {
  return produce(state, (draft) => {
    const rng = stateRng(draft)
    let remaining = total
    while (remaining > 1e-9) {
      const dt = Math.min(stepLength, remaining)
      step(draft, dt, rng)
      remaining -= dt
    }
  })
}
