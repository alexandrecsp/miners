import type { Draft } from 'immer'
import { UNLOCK_DEFS } from './defs'
import { isUnlockReached, isUnlocked } from './queries'
import type { GameState } from './types'

/**
 * Unlocks system: earns every Unlock whose Lifetime Counter has reached its threshold. Features read the earned
 * Unlocks; an Unlocked Area Unlock also grows the Unlocked Area, which never shrinks.
 */
export function unlocks(draft: Draft<GameState>): void {
  for (const def of UNLOCK_DEFS) {
    if (isUnlocked(draft, def.id) || !isUnlockReached(draft.lifetime, def)) continue
    draft.unlocks.push(def.id)
    if (def.effect.kind === 'unlockedArea') draft.grid.unlockedSize = Math.max(draft.grid.unlockedSize, def.effect.size)
  }
}
