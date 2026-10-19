import { serialiseSave } from '../core/save'
import { useGameStore } from '../store/gameStore'
import { writeSave } from './saveStorage'

const AUTOSAVE_INTERVAL_MS = 10_000

function saveNow(): void {
  writeSave(serialiseSave(useGameStore.getState().game, Date.now())).catch((error: unknown) => console.error('Autosave failed', error))
}

/** Saves every 10 s while the page is visible and once when it becomes hidden; returns a function that stops it. */
export function startAutosave(): () => void {
  const timer = setInterval(() => {
    if (!document.hidden) saveNow()
  }, AUTOSAVE_INTERVAL_MS)
  const onVisibility = () => {
    if (document.hidden) saveNow()
  }
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
