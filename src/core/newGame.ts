import {
  DEPOSIT_DEFS,
  GRID_DEFS,
  MACHINE_DEFS,
  RESOURCE_DEFS,
  RESOURCE_IDS,
  SAVE_VERSION,
  STARTING_CONDITION,
  STARTING_CREDITS,
  STARTING_KIT,
  STARTING_STORAGE_TIER,
} from './defs'
import type { DepositResource, MachineDefId, ResourceId, StatName } from './defs'
import { isTileUnlocked } from './queries'
import { stateRng } from './rng'
import type { Rng } from './rng'
import type { GameState, Machine, StorageEntry, Tile } from './types'

export function nextId(state: GameState, prefix: string): string {
  state.idCounter += 1
  return `${prefix}${state.idCounter}`
}

function middleStatsMachine(state: GameState, defId: MachineDefId): Machine {
  const def = MACHINE_DEFS[defId]
  const mid = (name: StatName) => (def.stats[name].min + def.stats[name].max) / 2
  return {
    id: nextId(state, 'm'),
    defId,
    baseStats: { rate: mid('rate'), efficiency: mid('efficiency'), durability: mid('durability') },
    condition: STARTING_CONDITION,
    lifetimeWear: 0,
    mods: Array.from({ length: def.modSlots }, () => null),
    tile: null,
  }
}

function fillRecord<V>(make: (r: ResourceId) => V): Record<ResourceId, V> {
  return Object.fromEntries(RESOURCE_IDS.map((r) => [r, make(r)])) as Record<ResourceId, V>
}

/** Removes and returns a random Tile from `free`, optionally only among those passing `filter`. */
function takeTile(rng: Rng, free: Tile[], filter?: (tile: Tile) => boolean): Tile {
  const candidates = filter ? free.filter(filter) : free
  const tile = candidates[Math.floor(rng.next() * candidates.length)]!
  free.splice(free.indexOf(tile), 1)
  return tile
}

export function newGame(seed: number): GameState {
  const { size, startUnlockedSize } = GRID_DEFS
  const state: GameState = {
    saveVersion: SAVE_VERSION,
    lastSeen: 0,
    simClock: 0,
    generator: seed >>> 0,
    idCounter: 0,
    credits: STARTING_CREDITS,
    storage: fillRecord((): StorageEntry => ({ amount: 0, tier: STARTING_STORAGE_TIER })),
    grid: { size, unlockedSize: startUnlockedSize, deposits: [], rocks: [] },
    machines: [],
    modInventory: {},
    market: fillRecord((r) => RESOURCE_DEFS[r].basePrice),
  }
  const rng = stateRng(state)

  const free: Tile[] = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) free.push({ x, y })
  const inside = (tile: Tile) => isTileUnlocked(state.grid, tile)

  const spawnDeposit = (resource: DepositResource, tile: Tile) => {
    const { min, max } = DEPOSIT_DEFS[resource].amount
    state.grid.deposits.push({
      id: nextId(state, 'd'),
      tile,
      resource,
      remaining: Math.round(min + rng.next() * (max - min)),
    })
  }

  const depositResources = Object.keys(DEPOSIT_DEFS) as DepositResource[]
  for (const resource of depositResources) {
    for (let i = 0; i < DEPOSIT_DEFS[resource].minInUnlocked; i++) spawnDeposit(resource, takeTile(rng, free, inside))
  }
  for (const resource of depositResources) {
    const def = DEPOSIT_DEFS[resource]
    for (let i = def.minInUnlocked; i < def.count; i++) spawnDeposit(resource, takeTile(rng, free))
  }
  for (let i = 0; i < GRID_DEFS.rocks; i++) state.grid.rocks.push(takeTile(rng, free))

  for (const defId of STARTING_KIT) state.machines.push(middleStatsMachine(state, defId))
  return state
}
