import type { Draft } from 'immer'
import { DEPOSIT_DEFS, DEPOSIT_SPAWN } from './defs'
import type { DepositResource } from './defs'
import { nextId } from './ids'
import { isTileUnlocked } from './queries'
import type { Rng } from './rng'
import { sameTile } from './tile'
import type { GameState, Tile } from './types'

/** Draws the sim-clock time of the next spawn after `from`: an exponential interval. */
export function drawNextSpawn(rng: Rng, from: number): number {
  return from - Math.log(1 - rng.next()) * DEPOSIT_SPAWN.meanInterval
}

function emptyUnlockedTiles(state: GameState): Tile[] {
  const tiles: Tile[] = []
  const { size } = state.grid
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = { x, y }
      if (!isTileUnlocked(state.grid, tile)) continue
      if (state.grid.rocks.some((r) => sameTile(r, tile))) continue
      if (state.grid.deposits.some((d) => sameTile(d.tile, tile))) continue
      if (state.machines.some((m) => m.tile && sameTile(m.tile, tile))) continue
      tiles.push(tile)
    }
  }
  return tiles
}

function belowDepositLimit(state: GameState): boolean {
  const inside = state.grid.deposits.filter((d) => isTileUnlocked(state.grid, d.tile)).length
  return inside * DEPOSIT_SPAWN.tilesPerDeposit < state.grid.unlockedSize ** 2
}

/**
 * Deposit spawn system: for each spawn time the sim clock has passed, puts a new Deposit on a random
 * Empty Tile in the Unlocked Area (below the Deposit limit), then draws the next spawn time.
 */
export function depositSpawn(draft: Draft<GameState>, _dt: number, rng: Rng): void {
  while (draft.simClock >= draft.grid.nextDepositSpawn) {
    const spawnTime = draft.grid.nextDepositSpawn
    if (belowDepositLimit(draft)) {
      const free = emptyUnlockedTiles(draft)
      if (free.length > 0) {
        const resource: DepositResource = rng.next() < DEPOSIT_SPAWN.oreShare ? 'ore' : 'crystal'
        const tile = free[Math.floor(rng.next() * free.length)]!
        const { min, max } = DEPOSIT_DEFS[resource].amount
        draft.grid.deposits.push({ id: nextId(draft, 'd'), tile, resource, remaining: Math.round(min + rng.next() * (max - min)) })
      }
    }
    draft.grid.nextDepositSpawn = drawNextSpawn(rng, spawnTime)
  }
}
