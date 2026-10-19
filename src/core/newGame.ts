import {
  DEPOSIT_DEFS,
  GRID_DEFS,
  MACHINE_DEFS,
  RESOURCE_DEFS,
  RESOURCE_IDS,
  SAVE_VERSION,
  SHOP,
  STARTING_CREDITS,
  STARTING_KIT,
  STARTING_STORAGE_TIER,
} from './defs'
import type { DepositResource, MachineDefId, ResourceId, StatName } from './defs'
import { nextId } from './ids'
import { isTileUnlocked } from './queries'
import { stateRng } from './rng'
import { buildMachine, fillShop } from './shop'
import { drawNextSpawn } from './spawn'
import type { Rng } from './rng'
import type { GameState, Machine, StorageEntry, Tile } from './types'

function middleStatsMachine(state: GameState, defId: MachineDefId): Machine {
  const def = MACHINE_DEFS[defId]
  const mid = (name: StatName) => (def.stats[name].min + def.stats[name].max) / 2
  return buildMachine(nextId(state, 'm'), defId, { rate: mid('rate'), efficiency: mid('efficiency'), durability: mid('durability') })
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
    grid: { size, unlockedSize: startUnlockedSize, deposits: [], rocks: [], nextDepositSpawn: 0 },
    lifetime: { creditsEarned: 0, mined: { ore: 0, crystal: 0 }, refined: fillRecord(() => 0), sold: fillRecord(() => 0) },
    unlocks: [],
    machines: [],
    modInventory: {},
    market: fillRecord((r) => RESOURCE_DEFS[r].basePrice),
    shop: { offers: [], nextRefresh: SHOP.interval },
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
  state.grid.nextDepositSpawn = drawNextSpawn(rng, state.simClock)
  fillShop(state, rng)
  return state
}
