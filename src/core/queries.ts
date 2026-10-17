import { MACHINE_DEFS, RESOURCE_DEFS, STAT_NAMES, STORAGE_TIER_MULTIPLIER } from './defs'
import type { ResourceId, StatName } from './defs'
import { fail, ok } from './result'
import type { Result } from './result'
import { effectiveStat } from './stats'
import { sameTile } from './tile'
import type { Deposit, GameState, GridShape, Machine, Tile } from './types'

/** The part of the Game State the Placement check reads. */
export type PlacementView = Pick<GameState, 'machines' | 'grid'>

/** Whether a Tile lies inside the Unlocked Area, the central square of the Grid. */
export function isTileUnlocked(grid: GridShape, tile: Tile): boolean {
  const margin = (grid.size - grid.unlockedSize) / 2
  const inRange = (v: number) => v >= margin && v < margin + grid.unlockedSize
  return inRange(tile.x) && inRange(tile.y)
}

/** The Storage Cap of a Resource at its current Storage Tier. */
export function storageCap(state: Pick<GameState, 'storage'>, resource: ResourceId): number {
  const { tier } = state.storage[resource]
  return RESOURCE_DEFS[resource].baseStorageCap * STORAGE_TIER_MULTIPLIER ** (tier - 1)
}

/** The room left under a Resource's Storage Cap. */
export function storageRoom(state: Pick<GameState, 'storage'>, resource: ResourceId): number {
  return Math.max(0, storageCap(state, resource) - state.storage[resource].amount)
}

/**
 * Whether a Machine may be placed on a Tile: the one check the Place action and the Scene's
 * highlights share. Checks the Machine, the Unlocked Area, other Machines, then the Machine Def's Tile rule.
 */
export function checkPlacement(state: PlacementView, machineId: string, tile: Tile): Result<null> {
  const machine = state.machines.find((m) => m.id === machineId)
  if (!machine) return fail('fail.machineNotFound')
  if (machine.tile) return fail('fail.alreadyPlaced')
  if (!isTileUnlocked(state.grid, tile)) return fail('fail.outsideUnlocked')
  const isTarget = (a: Tile) => sameTile(a, tile)
  if (state.machines.some((m) => m.tile && isTarget(m.tile))) return fail('fail.tileOccupied')

  const worksOn = MACHINE_DEFS[machine.defId].worksOn
  const deposit = state.grid.deposits.find((d) => isTarget(d.tile))
  if (deposit) return worksOn.includes(deposit.resource) ? ok(null) : fail('fail.wrongDeposit')
  if (state.grid.rocks.some(isTarget)) return fail('fail.tileHasRock')
  return worksOn.includes('empty') ? ok(null) : fail('fail.noDeposit')
}

/** The Effective Stats of a Machine; no Mods exist yet, so these are its Base Stats. */
export function effectiveStats(machine: Pick<Machine, 'baseStats'>): Record<StatName, number> {
  const result = {} as Record<StatName, number>
  for (const stat of STAT_NAMES) result[stat] = effectiveStat(machine.baseStats[stat], [], [])
  return result
}

/** The Deposit under a placed Machine that it can mine, if any. */
export function minableDepositAt(
  state: Pick<GameState, 'grid'>,
  machine: Pick<Machine, 'defId' | 'tile'>,
): Deposit | undefined {
  const tile = machine.tile
  if (!tile) return undefined
  const deposit = state.grid.deposits.find((d) => sameTile(d.tile, tile))
  return deposit && MACHINE_DEFS[machine.defId].worksOn.includes(deposit.resource) ? deposit : undefined
}

export type IdleReason = 'noDeposit' | 'storageFull'

export type MachineStatus = { kind: 'inventory' } | { kind: 'working' } | { kind: 'idle'; reason: IdleReason }

/**
 * The Machine Status: not placed, Working when the Mining system would produce from it now
 * (a minable Deposit and Storage room), otherwise Idle with its reason.
 */
export function machineStatus(state: GameState, machineId: string): MachineStatus {
  const machine = state.machines.find((m) => m.id === machineId)
  if (!machine || !machine.tile) return { kind: 'inventory' }
  const deposit = minableDepositAt(state, machine)
  if (!deposit) return { kind: 'idle', reason: 'noDeposit' }
  if (storageRoom(state, deposit.resource) <= 0) return { kind: 'idle', reason: 'storageFull' }
  return { kind: 'working' }
}

/** The Machines owned but not placed. */
export function inventoryMachines(state: Pick<GameState, 'machines'>): Machine[] {
  return state.machines.filter((m) => m.tile === null)
}

/** The Machine standing on a Tile, if any. */
export function machineAt(state: Pick<GameState, 'machines'>, tile: Tile): Machine | undefined {
  return state.machines.find((m) => m.tile !== null && sameTile(m.tile, tile))
}

/** Every Tile of the Grid that accepts the Machine, for highlighting. */
export function placementTiles(state: PlacementView, machineId: string): Tile[] {
  const tiles: Tile[] = []
  for (let y = 0; y < state.grid.size; y++) {
    for (let x = 0; x < state.grid.size; x++) {
      if (checkPlacement(state, machineId, { x, y }).ok) tiles.push({ x, y })
    }
  }
  return tiles
}
