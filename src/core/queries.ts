import { RESOURCE_DEFS, STORAGE_TIER_MULTIPLIER } from './defs'
import type { ResourceId } from './defs'
import type { GameState, GridShape, Tile } from './types'

/** Whether a Tile lies inside the Unlocked Area, the central square of the Grid. */
export function isTileUnlocked(grid: GridShape, tile: Tile): boolean {
  const margin = (grid.size - grid.unlockedSize) / 2
  const inRange = (v: number) => v >= margin && v < margin + grid.unlockedSize
  return inRange(tile.x) && inRange(tile.y)
}

/** The Storage Cap of a Resource at its current Storage Tier. */
export function storageCap(state: GameState, resource: ResourceId): number {
  const { tier } = state.storage[resource]
  return RESOURCE_DEFS[resource].baseStorageCap * STORAGE_TIER_MULTIPLIER ** (tier - 1)
}
