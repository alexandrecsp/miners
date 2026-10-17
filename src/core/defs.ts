import type { StringId } from './strings'

export type ResourceId = 'ore' | 'crystal' | 'alloy'
export type MachineDefId = 'drill' | 'laserMiner' | 'refinery'
export type StatName = 'rate' | 'efficiency' | 'durability'
export type DepositResource = 'ore' | 'crystal'
export type WorksOn = DepositResource | 'empty'

export const SAVE_VERSION = 1

export const STAT_NAMES: readonly StatName[] = ['rate', 'efficiency', 'durability']

export const RESOURCE_IDS: readonly ResourceId[] = ['ore', 'crystal', 'alloy']

export interface Range {
  min: number
  max: number
}

export interface MachineDef {
  id: MachineDefId
  nameId: StringId
  worksOn: readonly WorksOn[]
  stats: Record<StatName, Range>
  wearRate: number
  modSlots: number
  basePrice: number
  repairPerPoint: number
  movePerTile: number
}

export const MACHINE_DEFS: Record<MachineDefId, MachineDef> = {
  drill: {
    id: 'drill',
    nameId: 'machine.drill',
    worksOn: ['ore'],
    stats: { rate: { min: 0.8, max: 1.2 }, efficiency: { min: 0.8, max: 1.2 }, durability: { min: 0.8, max: 1.2 } },
    wearRate: 0.25,
    modSlots: 2,
    basePrice: 60,
    repairPerPoint: 0.3,
    movePerTile: 2,
  },
  laserMiner: {
    id: 'laserMiner',
    nameId: 'machine.laserMiner',
    worksOn: ['ore', 'crystal'],
    stats: { rate: { min: 2, max: 3 }, efficiency: { min: 0.8, max: 1.2 }, durability: { min: 0.8, max: 1.2 } },
    wearRate: 0.8,
    modSlots: 3,
    basePrice: 400,
    repairPerPoint: 1,
    movePerTile: 5,
  },
  refinery: {
    id: 'refinery',
    nameId: 'machine.refinery',
    worksOn: ['empty'],
    stats: { rate: { min: 0.3, max: 0.5 }, efficiency: { min: 0.8, max: 1.2 }, durability: { min: 0.8, max: 1.2 } },
    wearRate: 0.15,
    modSlots: 2,
    basePrice: 150,
    repairPerPoint: 0.5,
    movePerTile: 4,
  },
}

export interface ResourceDef {
  id: ResourceId
  nameId: StringId
  basePrice: number
  marketDepth: number
  baseStorageCap: number
}

export const RESOURCE_DEFS: Record<ResourceId, ResourceDef> = {
  ore: { id: 'ore', nameId: 'resource.ore', basePrice: 1, marketDepth: 2000, baseStorageCap: 200 },
  crystal: { id: 'crystal', nameId: 'resource.crystal', basePrice: 6, marketDepth: 400, baseStorageCap: 100 },
  alloy: { id: 'alloy', nameId: 'resource.alloy', basePrice: 8, marketDepth: 400, baseStorageCap: 100 },
}

/** The fixed amounts the Market panel offers to sell, besides "all". */
export const SELL_AMOUNTS: readonly number[] = [10, 100]

export const MARKET_DRIFT = {
  /** Sim seconds for a price's gap to its Base Price to halve. */
  halfLife: 120,
  /** Typical deviation (stationary standard deviation) as a share of the Base Price. */
  deviation: 0.15,
  /** A Market Price never falls below this share of its Base Price. */
  floor: 0.2,
}

export interface DepositDef {
  count: number
  minInUnlocked: number
  amount: Range
}

export const DEPOSIT_DEFS: Record<DepositResource, DepositDef> = {
  ore: { count: 120, minInUnlocked: 6, amount: { min: 400, max: 1200 } },
  crystal: { count: 50, minInUnlocked: 2, amount: { min: 200, max: 600 } },
}

export const DEPOSIT_SPAWN = {
  /** Mean sim seconds between spawns (exponential intervals). */
  meanInterval: 30,
  oreShare: 0.75,
  /** The Unlocked Area holds at most one Deposit per this many Tiles. */
  tilesPerDeposit: 12,
}

export const GRID_DEFS = {
  size: 32,
  startUnlockedSize: 12,
  rocks: 200,
}

/** Output factor at 100% Condition; Wear (T014) will make it follow Condition. */
export const FULL_CONDITION_OUTPUT_FACTOR = 1

/** Whether a Machine Def mines Deposits (as opposed to working on Empty Tiles). */
export function isMiner(defId: MachineDefId): boolean {
  return !MACHINE_DEFS[defId].worksOn.includes('empty')
}

export const STARTING_CONDITION = 100
export const STARTING_STORAGE_TIER = 1
export const STARTING_CREDITS = 50
export const STARTING_KIT: readonly MachineDefId[] = ['drill']

export const PACING = {
  tick: 0.1,
  maxTicksPerCall: 10,
  gapThreshold: 1,
}

export const STORAGE_TIER_MULTIPLIER = 2.5
