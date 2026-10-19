import type { DepositResource, MachineDefId, RecipeId, ResourceId, StatName, UnlockId } from './defs'

export interface Tile {
  x: number
  y: number
}

export interface Deposit {
  id: string
  tile: Tile
  resource: DepositResource
  remaining: number
}

export interface Machine {
  id: string
  defId: MachineDefId
  baseStats: Record<StatName, number>
  condition: number
  lifetimeWear: number
  mods: (string | null)[]
  tile: Tile | null
  /** A Refinery's Recipe; null for Machines that do not refine. */
  recipeId: RecipeId | null
}

/** A pre-rolled Machine in the Shop Stock, with the price to buy it. */
export interface Offer {
  machine: Machine
  price: number
}

export interface StorageEntry {
  amount: number
  tier: number
}

/** The size data that decides which Tiles lie inside the Unlocked Area. */
export type GridShape = Pick<GameState['grid'], 'size' | 'unlockedSize'>

/** The Lifetime Counters: totals that only ever grow, added to through `lifetime.ts`. Unlocks read them. */
export interface LifetimeCounters {
  /** Credits earned from Sales. */
  creditsEarned: number
  mined: Record<DepositResource, number>
  refined: Record<ResourceId, number>
  sold: Record<ResourceId, number>
}

export interface GameState {
  saveVersion: number
  lastSeen: number
  simClock: number
  generator: number
  idCounter: number
  credits: number
  storage: Record<ResourceId, StorageEntry>
  grid: {
    size: number
    unlockedSize: number
    deposits: Deposit[]
    rocks: Tile[]
    /** Sim-clock time of the next Deposit spawn. */
    nextDepositSpawn: number
  }
  lifetime: LifetimeCounters
  unlocks: UnlockId[]
  machines: Machine[]
  modInventory: Record<string, number>
  market: Record<ResourceId, number>
  shop: {
    offers: Offer[]
    /** Sim-clock time of the next timed Shop Refresh. */
    nextRefresh: number
  }
}
