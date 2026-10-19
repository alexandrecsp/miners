import type { Draft } from 'immer'
import { outputFactor } from './defs'
import { addMined } from './lifetime'
import { effectiveStats, ROOM_EPSILON, minableDepositAt, placedMachinesInIdOrder, storageRoom } from './queries'
import type { Rng } from './rng'
import type { StepContext } from './stepContext'
import type { GameState } from './types'

/**
 * Mining system: each placed Miner on a Deposit it can mine yields up to Rate x output factor x dt,
 * limited by the room under the Storage Cap and by what the Deposit can give. Machines run in id order.
 */
export function mining(draft: Draft<GameState>, dt: number, _rng: Rng, ctx: StepContext): void {
  for (const machine of placedMachinesInIdOrder(draft, 'miner')) {
    const deposit = minableDepositAt(draft, machine)
    if (!deposit) continue
    const stats = effectiveStats(machine)
    const wanted = stats.rate * outputFactor(machine.condition) * dt
    const available = deposit.remaining * stats.efficiency
    const room = storageRoom(draft, deposit.resource)
    if (room <= ROOM_EPSILON) continue
    const given = Math.min(wanted, room, available)
    if (given <= 0) continue
    ctx.outputShares.set(machine.id, given / wanted)
    addMined(draft, deposit.resource, given)
    if (given >= available) {
      draft.grid.deposits = draft.grid.deposits.filter((d) => d.id !== deposit.id)
    } else {
      deposit.remaining -= given / stats.efficiency
    }
  }
}
