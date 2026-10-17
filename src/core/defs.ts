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
  /** Whether the Shop stocks this Machine Def from a new game; Unlocks add the rest. */
  availableAtStart: boolean
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
    availableAtStart: true,
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
    availableAtStart: false,
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
    availableAtStart: true,
    basePrice: 150,
    repairPerPoint: 0.5,
    movePerTile: 4,
  },
}

export type RecipeId = 'oreToAlloy' | 'oreCrystalToAlloy'

export interface RecipeDef {
  id: RecipeId
  nameId: StringId
  /** Resources consumed per batch. */
  inputs: Partial<Record<ResourceId, number>>
  /** The Resource a batch makes. */
  output: ResourceId
  /** Units of the output per batch, before Efficiency. */
  outputAmount: number
}

export const RECIPE_DEFS: Record<RecipeId, RecipeDef> = {
  oreToAlloy: { id: 'oreToAlloy', nameId: 'recipe.oreToAlloy', inputs: { ore: 4 }, output: 'alloy', outputAmount: 1 },
  oreCrystalToAlloy: { id: 'oreCrystalToAlloy', nameId: 'recipe.oreCrystalToAlloy', inputs: { ore: 2, crystal: 1 }, output: 'alloy', outputAmount: 2 },
}

/** The input Resources of a Recipe with their units per batch. */
export function recipeInputs(recipe: RecipeDef): [ResourceId, number][] {
  return Object.entries(recipe.inputs) as [ResourceId, number][]
}

/** The Recipe every new Refinery starts on. */
export const DEFAULT_RECIPE: RecipeId = 'oreToAlloy'

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

/** Whether a Condition is Broken: 0% or below. The one place that rule lives. */
export function isBroken(condition: number): boolean {
  return condition <= 0
}

/** The output factor of a Machine: 0.5 + 0.5 x Condition / 100 while Condition is above 0, and 0 when Broken. */
export function outputFactor(condition: number): number {
  return !isBroken(condition) ? 0.5 + (0.5 * condition) / 100 : 0
}

/** Whether a Machine Def mines Deposits (as opposed to working on Empty Tiles). */
export function isMiner(defId: MachineDefId): boolean {
  return !MACHINE_DEFS[defId].worksOn.includes('empty')
}

export const STARTING_CONDITION = 100

/** The Condition a Repair restores. */
export const MAX_CONDITION = 100

/** Lifetime Wear that adds 100% to a Machine's Repair cost. */
export const REPAIR_WEAR_DIVISOR = 1000
export const STARTING_STORAGE_TIER = 1
export const STARTING_CREDITS = 50
export const STARTING_KIT: readonly MachineDefId[] = ['drill']

export const PACING = {
  tick: 0.1,
  maxTicksPerCall: 10,
  gapThreshold: 1,
}

export const SHOP = {
  offers: 4,
  /** Sim seconds between timed Shop Refreshes. */
  interval: 180,
  refreshCost: 20,
  /** An Offer's price as a share of the base price: min at roll quality 0, max at roll quality 1. */
  price: { min: 0.7, max: 1.3 },
}

export const STORAGE_TIER_MULTIPLIER = 2.5
