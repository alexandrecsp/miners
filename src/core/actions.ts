import { produce } from 'immer'
import type { ResourceId } from './defs'
import { checkPlacement, checkSale, saleOutcome } from './queries'
import { ok } from './result'
import type { Result } from './result'
import type { GameState, Tile } from './types'

/** Command: a player intent as a plain value. */
export type PlayerAction =
  | { kind: 'place'; machineId: string; tile: Tile }
  | { kind: 'sell'; resource: ResourceId; amount: number }

/** Apply a Player Action: the next Game State, or a failure reason with the state untouched. */
export function applyAction(state: GameState, action: PlayerAction): Result<GameState> {
  switch (action.kind) {
    case 'place': {
      const check = checkPlacement(state, action.machineId, action.tile)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.machines.find((m) => m.id === action.machineId)!.tile = { ...action.tile }
        }),
      )
    }
    case 'sell': {
      const { resource, amount } = action
      const check = checkSale(state, resource, amount)
      if (!check.ok) return check
      const { credits, price } = saleOutcome(state, resource, amount)
      return ok(
        produce(state, (draft) => {
          draft.storage[resource].amount -= amount
          draft.credits += credits
          draft.market[resource] = price
        }),
      )
    }
  }
}
