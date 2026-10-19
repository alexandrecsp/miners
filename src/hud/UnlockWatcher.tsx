import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'

/** Queues a notice for each Unlock earned since the last render, by comparing the earned Unlocks it last saw. Renders nothing. */
export function UnlockWatcher() {
  const unlocks = useGameStore((s) => s.game.unlocks)
  const seen = useRef(unlocks)
  useEffect(() => {
    const fresh = unlocks.filter((id) => !seen.current.includes(id))
    seen.current = unlocks
    for (const id of fresh) useUiStore.getState().showUnlockEarned(id)
  }, [unlocks])
  return null
}
