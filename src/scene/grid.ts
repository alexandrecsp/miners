import type { Tile } from '../core/types'

/** World position of a Tile's centre on the ground plane; the Grid is centred on the origin. */
export function tileToWorld(tile: Tile, gridSize: number): { x: number; z: number } {
  return { x: tile.x + 0.5 - gridSize / 2, z: tile.y + 0.5 - gridSize / 2 }
}

/** The Tile under a ground-plane point, or null when the point is off the Grid. */
export function worldToTile(x: number, z: number, gridSize: number): Tile | null {
  const tx = Math.floor(x + gridSize / 2)
  const ty = Math.floor(z + gridSize / 2)
  if (tx < 0 || ty < 0 || tx >= gridSize || ty >= gridSize) return null
  return { x: tx, y: ty }
}
