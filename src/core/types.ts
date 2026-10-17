import type { DepositResource, MachineDefId, ResourceId, StatName } from './defs'

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
  machines: Machine[]
  modInventory: Record<string, number>
  market: Record<ResourceId, number>
  shop: {
    offers: Offer[]
    /** Sim-clock time of the next timed Shop Refresh. */
    nextRefresh: number
  }
}
