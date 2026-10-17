import { MACHINE_DEFS, RESOURCE_DEFS, SHOP, STAT_NAMES, STORAGE_TIER_MULTIPLIER } from './defs'
import type { MachineDefId, ResourceId, StatName } from './defs'
import { fail, ok } from './result'
import type { Result } from './result'
import { effectiveStat } from './stats'
import { sameTile } from './tile'
import type { Deposit, GameState, GridShape, Machine, Offer, Tile } from './types'

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

/** Whether a Machine may stand on a Tile: the Def's rules, the Unlocked Area and other Machines. Shared by Placement and Move. */
function checkTarget(state: PlacementView, machine: Machine, tile: Tile): Result<null> {
  if (!MACHINE_DEFS[machine.defId].placeable) return fail('fail.placementNotAvailable')
  if (!isTileUnlocked(state.grid, tile)) return fail('fail.outsideUnlocked')
  const isTarget = (a: Tile) => sameTile(a, tile)
  if (state.machines.some((m) => m.tile && isTarget(m.tile))) return fail('fail.tileOccupied')

  const worksOn = MACHINE_DEFS[machine.defId].worksOn
  const deposit = state.grid.deposits.find((d) => isTarget(d.tile))
  if (deposit) return worksOn.includes(deposit.resource) ? ok(null) : fail('fail.wrongDeposit')
  if (state.grid.rocks.some(isTarget)) return fail('fail.tileHasRock')
  return worksOn.includes('empty') ? ok(null) : fail('fail.noDeposit')
}

/**
 * Whether a Machine may be placed on a Tile: the one check the Place action and the Scene's
 * highlights share. Checks the Machine, the Unlocked Area, other Machines, then the Machine Def's Tile rule.
 */
export function checkPlacement(state: PlacementView, machineId: string, tile: Tile): Result<null> {
  const machine = state.machines.find((m) => m.id === machineId)
  if (!machine) return fail('fail.machineNotFound')
  if (machine.tile) return fail('fail.alreadyPlaced')
  return checkTarget(state, machine, tile)
}

/** The Move cost: the Machine Def's Move cost per Tile x the Manhattan distance, rounded up to whole Credits. */
export function moveCost(defId: MachineDefId, from: Tile, to: Tile): number {
  const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
  return Math.ceil(MACHINE_DEFS[defId].movePerTile * distance - 1e-9)
}

/**
 * Whether a placed Machine may be moved to a Tile and what it costs: the one check the Move action and
 * the Scene's highlights share. The Tile must pass the Placement rules; the Machine's own Tile fails.
 */
export function checkMove(state: PlacementView & Pick<GameState, 'credits'>, machineId: string, tile: Tile): Result<number> {
  const machine = state.machines.find((m) => m.id === machineId)
  if (!machine) return fail('fail.machineNotFound')
  if (!machine.tile) return fail('fail.notPlaced')
  if (sameTile(machine.tile, tile)) return fail('fail.sameTile')
  const target = checkTarget(state, machine, tile)
  if (!target.ok) return target
  const cost = moveCost(machine.defId, machine.tile, tile)
  return state.credits >= cost ? ok(cost) : fail('fail.notEnoughCredits')
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

/** Every Tile of the Grid the placed Machine may be moved to, for highlighting; Credits are not considered. */
export function moveTiles(state: PlacementView, machineId: string): Tile[] {
  const tiles: Tile[] = []
  for (let y = 0; y < state.grid.size; y++) {
    for (let x = 0; x < state.grid.size; x++) {
      if (checkMove({ ...state, credits: Infinity }, machineId, { x, y }).ok) tiles.push({ x, y })
    }
  }
  return tiles
}

/** What a Sale of `amount` does at Market Price `price`: the Credits earned, p x D x (1 - e^(-a/D)), and the price left, p x e^(-a/D). */
export function saleOutcomeAt(price: number, resource: ResourceId, amount: number): { credits: number; price: number } {
  const depth = RESOURCE_DEFS[resource].marketDepth
  const decay = Math.exp(-amount / depth)
  return { credits: price * depth * (1 - decay), price: price * decay }
}

/** What a Sale of `amount` does at the Resource's current Market Price. */
export function saleOutcome(
  state: Pick<GameState, 'market'>,
  resource: ResourceId,
  amount: number,
): { credits: number; price: number } {
  return saleOutcomeAt(state.market[resource], resource, amount)
}

/** Whether `amount` may be sold from `stored` units: the one check the Sell action and the Market panel share. */
export function checkSaleAmount(stored: number, amount: number): Result<null> {
  if (!(amount > 0)) return fail('fail.invalidAmount')
  if (amount > stored) return fail('fail.notEnoughResource')
  return ok(null)
}

/** Whether `amount` of a Resource may be sold from Storage. */
export function checkSale(state: Pick<GameState, 'storage'>, resource: ResourceId, amount: number): Result<null> {
  return checkSaleAmount(state.storage[resource].amount, amount)
}

/** Whether the Shop may be refreshed for a fee: the one check the Refresh Shop action and the Shop panel share. */
export function checkShopRefresh(state: Pick<GameState, 'credits'>): Result<null> {
  return state.credits >= SHOP.refreshCost ? ok(null) : fail('fail.notEnoughCredits')
}

/** Whether an Offer, named by its rolled Machine's id, may be bought: the one check the Buy Offer action and the Shop panel share. */
export function checkBuyOffer(state: Pick<GameState, 'credits' | 'shop'>, machineId: string): Result<Offer> {
  const offer = state.shop.offers.find((o) => o.machine.id === machineId)
  if (!offer) return fail('fail.offerNotFound')
  return state.credits >= offer.price ? ok(offer) : fail('fail.notEnoughCredits')
}

/** Sim seconds until the next timed Shop Refresh. */
export function shopCountdown(state: Pick<GameState, 'simClock' | 'shop'>): number {
  return Math.max(0, state.shop.nextRefresh - state.simClock)
}

/** Roll quality: the mean of the Base Stats' positions within their Machine Def's ranges, 0 to 1. */
export function rollQuality(machine: Pick<Machine, 'defId' | 'baseStats'>): number {
  const def = MACHINE_DEFS[machine.defId]
  let total = 0
  for (const stat of STAT_NAMES) {
    const { min, max } = def.stats[stat]
    total += (machine.baseStats[stat] - min) / (max - min)
  }
  return total / STAT_NAMES.length
}

/** Offer price: base price x (0.7 + 0.6 x roll quality), rounded up to whole Credits. */
export function offerPrice(defId: MachineDefId, quality: number): number {
  const { min, max } = SHOP.price
  const raw = MACHINE_DEFS[defId].basePrice * (min + (max - min) * quality)
  // The tolerance keeps float noise (78.00000000000001) from rounding an exact price up by a Credit.
  return Math.ceil(raw - 1e-9)
}
