import type { Tile } from './types'

export const sameTile = (a: Tile, b: Tile): boolean => a.x === b.x && a.y === b.y

export const tileKey = (tile: Tile): string => `${tile.x},${tile.y}`
