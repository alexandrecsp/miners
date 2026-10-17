import { PACING } from './defs'

export interface PacingResult {
  ticks: number
  accumulator: number
  /** Real seconds to hand to Offline Replay, when one call saw too much time. */
  gap: number | null
}

export function pace(accumulator: number, elapsed: number): PacingResult {
  if (elapsed > PACING.gapThreshold) return { ticks: 0, accumulator, gap: elapsed }
  const total = accumulator + elapsed
  // The epsilon absorbs float error such as 0.3 / 0.1 = 2.9999999999999996.
  const ticks = Math.min(PACING.maxTicksPerCall, Math.floor(total / PACING.tick + 1e-9))
  return { ticks, accumulator: Math.max(0, total - ticks * PACING.tick), gap: null }
}
