import { PACING } from '../core/defs'
import { pace } from '../core/pacing'
import { replayAway, runTicks } from './gameStore'

const INTERVAL_MS = PACING.tick * 1000

/** Starts the Sim Loop outside React; returns a function that stops it. */
export function startSimLoop(): () => void {
  let timer: ReturnType<typeof setInterval> | null = null
  let last = 0
  let accumulator = 0
  /** Real time (ms) of the last Tick, from the clock that keeps counting while the device sleeps; boot replayed up to now. */
  let lastTickAt = Date.now()

  const tick = () => {
    const now = performance.now()
    const result = pace(accumulator, (now - last) / 1000)
    last = now
    lastTickAt = Date.now()
    accumulator = result.accumulator
    if (result.gap !== null) replayAway(result.gap)
    if (result.ticks > 0) runTicks(result.ticks)
  }
  const start = () => {
    if (timer !== null) return
    // On return to a visible page, the time since the last Tick goes to Offline Replay.
    replayAway((Date.now() - lastTickAt) / 1000)
    lastTickAt = Date.now()
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
