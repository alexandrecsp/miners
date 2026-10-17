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

export interface StorageEntry {
  amount: number
  tier: number
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
  }
  machines: Machine[]
  modInventory: Record<string, number>
  market: Record<ResourceId, number>
}
