import type { Draft } from 'immer'
import { FULL_CONDITION_OUTPUT_FACTOR } from './defs'
import { effectiveStats, minableDepositAt, placedMachinesInIdOrder, storageRoom } from './queries'
import type { GameState } from './types'

/**
 * Mining system: each placed Miner on a Deposit it can mine yields up to Rate x output factor x dt,
 * limited by the room under the Storage Cap and by what the Deposit can give. Machines run in id order.
 */
export function mining(draft: Draft<GameState>, dt: number): void {
  for (const machine of placedMachinesInIdOrder(draft, 'miner')) {
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
