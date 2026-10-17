import { produce } from 'immer'
import { SHOP } from './defs'
import type { RecipeId, ResourceId } from './defs'
import { checkBuyOffer, checkMove, checkPlacement, checkSale, checkSetRecipe, checkShopRefresh, saleOutcome } from './queries'
import { stateRng } from './rng'
import { nextId } from './ids'
import { fillShop } from './shop'
import { ok } from './result'
import type { Result } from './result'
import type { GameState, Tile } from './types'

/** Command: a player intent as a plain value. */
export type PlayerAction =
  | { kind: 'place'; machineId: string; tile: Tile }
  | { kind: 'move'; machineId: string; tile: Tile }
  | { kind: 'sell'; resource: ResourceId; amount: number }
  /** `machineId` is the Offer's id: the id of the rolled Machine it holds in the Shop Stock. */
  | { kind: 'buyOffer'; machineId: string }
  | { kind: 'refreshShop' }
  | { kind: 'setRecipe'; machineId: string; recipeId: RecipeId }

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
    case 'move': {
      const check = checkMove(state, action.machineId, action.tile)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.credits -= check.value
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
    case 'buyOffer': {
      const check = checkBuyOffer(state, action.machineId)
      if (!check.ok) return check
      const offer = check.value
      return ok(
        produce(state, (draft) => {
          draft.credits -= offer.price
          draft.shop.offers = draft.shop.offers.filter((o) => o.machine.id !== action.machineId)
          // The Offer's Machine was built by buildMachine: full Condition, no Wear.
          draft.machines.push({ ...structuredClone(offer.machine), id: nextId(draft, 'm') })
        }),
      )
    }
    case 'refreshShop': {
      const check = checkShopRefresh(state)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.credits -= SHOP.refreshCost
          fillShop(draft, stateRng(draft))
        }),
      )
    }
    case 'setRecipe': {
      const check = checkSetRecipe(state, action.machineId, action.recipeId)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.machines.find((m) => m.id === action.machineId)!.recipeId = action.recipeId
        }),
      )
    }
  }
}
