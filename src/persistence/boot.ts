import { newGame } from '../core/newGame'
import { replayOffline } from '../core/offline'
import { loadSave } from '../core/save'
import type { StringId } from '../core/strings'
import { applyOfflineReplay, replaceGame } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { readSave, writeBackup } from './saveStorage'

/**
 * The boot sequence: restore the stored Save into the Game Store and run Offline Replay from its Last Seen, or start
 * a new game seeded from the clock when there is none, or when it fails to load or to replay (after copying its raw
 * value to the backup key). It never rejects, so the Sim Loop always starts.
 */
export async function boot(): Promise<void> {
  let raw: unknown
  try {
    raw = await readSave()
  } catch (error) {
    console.error('Reading the Save failed; starting a new game', error)
    return replaceGame(newGame(Date.now()))
  }
  if (raw === undefined) return replaceGame(newGame(Date.now()))
  const loaded = loadSave(raw)
  if (!loaded.ok) return startOver(raw, loaded.reason)
  try {
    applyOfflineReplay(replayOffline(loaded.value, Date.now()))
  } catch (error) {
    console.error('Offline Replay of the Save failed; starting a new game', error)
    await startOver(raw, 'fail.notASave')
  }
}

/** Backs up the unusable raw Save, shows why it failed, and starts a new game. */
async function startOver(raw: unknown, reason: StringId): Promise<void> {
  await writeBackup(raw).catch((error: unknown) => console.error('Backing up the unusable Save failed', error))
  useUiStore.getState().showFailure(reason)
  replaceGame(newGame(Date.now()))
}
