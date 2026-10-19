import { RESOURCE_IDS, SAVE_VERSION } from './defs'
import { fail, ok } from './result'
import type { Result } from './result'
import type { GameState } from './types'

/** A Save: the stored copy of the Game State, which carries its own Save Version and Last Seen. */
export type Save = GameState

/** A Save of any Save Version, as plain data. */
export type RawSave = Record<string, unknown>

/** Turns a Save of one Save Version into the shape of the next; the loader then sets the new Save Version. */
export type Migration = (save: RawSave) => RawSave

const FIRST_SAVE_VERSION = 1

/** The production Migration chain: entry i turns Save Version i + 1 into i + 2. Empty while the Save Version is 1. */
export const MIGRATIONS: readonly Migration[] = []

/** Serialise a Game State into a Save at the current real time `now` (milliseconds). */
export function serialiseSave(state: GameState, now: number): Save {
  return { ...state, saveVersion: SAVE_VERSION, lastSeen: now }
}

/**
 * Load a raw stored value into a Game State by running the Migration chain from its Save Version to the
 * current one, which is the version the last Migration in `migrations` produces.
 */
export function loadSave(raw: unknown, migrations: readonly Migration[] = MIGRATIONS): Result<GameState> {
  if (!isSave(raw)) return fail('fail.notASave')
  const current = FIRST_SAVE_VERSION + migrations.length
  if (raw.saveVersion > current) return fail('fail.saveTooNew')
  let save: RawSave = raw
  try {
    for (let version = raw.saveVersion; version < current; version++) {
      save = { ...migrations[version - FIRST_SAVE_VERSION]!(save), saveVersion: version + 1 }
    }
  } catch {
    return fail('fail.migrationFailed')
  }
  return isGameState(save) ? ok(save) : fail('fail.notASave')
}

function isSave(raw: unknown): raw is RawSave & { saveVersion: number } {
  if (!isRecord(raw)) return false
  const { saveVersion } = raw
  return typeof saveVersion === 'number' && Number.isInteger(saveVersion) && saveVersion >= FIRST_SAVE_VERSION
}

const isRecord = (value: unknown): value is RawSave => typeof value === 'object' && value !== null && !Array.isArray(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const hasNumbers = (value: unknown, keys: readonly string[]): boolean => isRecord(value) && keys.every((k) => isNumber(value[k]))
const isListOf = (value: unknown, item: (entry: unknown) => boolean): boolean => Array.isArray(value) && value.every(item)
const isTile = (value: unknown): boolean => hasNumbers(value, ['x', 'y'])
const hasPerResource = (value: unknown, entry: (v: unknown) => boolean): boolean =>
  isRecord(value) && RESOURCE_IDS.every((r) => entry(value[r]))

const isMachine = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.defId === 'string' &&
  hasNumbers(value, ['condition', 'lifetimeWear']) &&
  isRecord(value.baseStats) &&
  Array.isArray(value.mods) &&
  (value.tile === null || isTile(value.tile))

const isDeposit = (value: unknown): boolean =>
  isRecord(value) && typeof value.id === 'string' && typeof value.resource === 'string' && isNumber(value.remaining) && isTile(value.tile)

/** A minimal structural check of the Game State fields the Game core relies on, so a broken Save fails to load instead of throwing later. */
function isGameState(save: RawSave): save is RawSave & GameState {
  const { grid, lifetime, shop } = save
  return (
    hasNumbers(save, ['lastSeen', 'simClock', 'generator', 'idCounter', 'credits']) &&
    hasPerResource(save.storage, (entry) => hasNumbers(entry, ['amount', 'tier'])) &&
    hasPerResource(save.market, isNumber) &&
    hasPerResource(save.sellOrders, (order) => order === null || hasNumbers(order, ['minPrice', 'reserve'])) &&
    isRecord(grid) &&
    hasNumbers(grid, ['size', 'unlockedSize', 'nextDepositSpawn']) &&
    isListOf(grid.deposits, isDeposit) &&
    isListOf(grid.rocks, isTile) &&
    isRecord(lifetime) &&
    isNumber(lifetime.creditsEarned) &&
    [lifetime.mined, lifetime.refined, lifetime.sold].every(isRecord) &&
    isListOf(save.unlocks, (id) => typeof id === 'string') &&
    isListOf(save.machines, isMachine) &&
    isRecord(save.modInventory) &&
    isRecord(shop) &&
    isNumber(shop.nextRefresh) &&
    isListOf(shop.offers, (offer) => isRecord(offer) && isMachine(offer.machine) && isNumber(offer.price))
  )
}
