import { get, set } from 'idb-keyval'
import type { Save } from '../core/save'

/** The one fixed idb-keyval key holding the Save record. */
const SAVE_KEY = 'miners.save'
/** Where an unloadable Save's raw value is copied before a new game overwrites it. */
const BACKUP_KEY = 'miners.save.backup'

/** The raw stored Save value, or undefined when there is none. Untrusted: run it through `loadSave`. */
export function readSave(): Promise<unknown> {
  return get(SAVE_KEY)
}

export function writeSave(save: Save): Promise<void> {
  return set(SAVE_KEY, save)
}

export function writeBackup(raw: unknown): Promise<void> {
  return set(BACKUP_KEY, raw)
}
