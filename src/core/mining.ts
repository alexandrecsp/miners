import type { Draft } from 'immer'
import { FULL_CONDITION_OUTPUT_FACTOR, isMiner } from './defs'
import { compareIds } from './ids'
import { effectiveStats, minableDepositAt, storageRoom } from './queries'
import type { GameState } from './types'

/**
 * Mining system: each placed Miner on a Deposit it can mine yields up to Rate x output factor x dt,
 * limited by the room under the Storage Cap and by what the Deposit can give. Machines run in id order.
 */
export function mining(draft: Draft<GameState>, dt: number): void {
  const miners = draft.machines.filter((m) => m.tile !== null && isMiner(m.defId)).sort((a, b) => compareIds(a.id, b.id))
  for (const machine of miners) {
    const deposit = minableDepositAt(draft, machine)
    if (!deposit) continue
    const stats = effectiveStats(machine)
    const wanted = stats.rate * FULL_CONDITION_OUTPUT_FACTOR * dt
    const available = deposit.remaining * stats.efficiency
    const given = Math.min(wanted, storageRoom(draft, deposit.resource), available)
    if (given <= 0) continue
    draft.storage[deposit.resource].amount += given
    if (given >= available) {
      draft.grid.deposits = draft.grid.deposits.filter((d) => d.id !== deposit.id)
    } else {
      deposit.remaining -= given / stats.efficiency
    }
  }
}
