import { PACING } from '../core/defs'
import { pace } from '../core/pacing'
import { runTicks } from './gameStore'

const INTERVAL_MS = PACING.tick * 1000

/** Starts the Sim Loop outside React; returns a function that stops it. */
export function startSimLoop(): () => void {
  let timer: ReturnType<typeof setInterval> | null = null
  let last = 0
  let accumulator = 0

  const tick = () => {
    const now = performance.now()
    const result = pace(accumulator, (now - last) / 1000)
    last = now
    accumulator = result.accumulator
    // A returned gap is dropped until Offline Replay exists (T024).
    if (result.ticks > 0) runTicks(result.ticks)
  }
  const start = () => {
    if (timer !== null) return
    // Resetting `last` drops the hidden time; T024 will hand it to Offline Replay instead.
    last = performance.now()
    timer = setInterval(tick, INTERVAL_MS)
  }
  const stop = () => {
    if (timer !== null) clearInterval(timer)
    timer = null
  }
  const onVisibility = () => (document.hidden ? stop() : start())

  document.addEventListener('visibilitychange', onVisibility)
  if (!document.hidden) start()
  return () => {
    stop()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
