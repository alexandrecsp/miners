import { produce } from 'immer'
import { MAX_CONDITION, MOD_DEFS, SHOP } from './defs'
import type { ModDefId, RecipeId, ResourceId } from './defs'
import { checkBuyMod, checkBuyOffer, checkFitMod, checkMove, checkPlacement, checkRemoveMod, checkRepair, checkSale, checkSetRecipe, checkSetSellOrder, checkShopRefresh, checkStorageUpgrade } from './queries'
import { stateRng } from './rng'
import { applySale } from './market'
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
  | { kind: 'repair'; machineId: string }
  | { kind: 'buyMod'; modId: ModDefId }
  | { kind: 'fitMod'; machineId: string; modId: ModDefId }
  | { kind: 'removeMod'; machineId: string; slot: number }
  | { kind: 'buyStorageUpgrade'; resource: ResourceId }
  | { kind: 'setSellOrder'; resource: ResourceId; minPrice: number; reserve: number }
  | { kind: 'clearSellOrder'; resource: ResourceId }

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
      return ok(
        produce(state, (draft) => {
          applySale(draft, resource, amount)
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
    case 'repair': {
      const check = checkRepair(state, action.machineId)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.credits -= check.value
          draft.machines.find((m) => m.id === action.machineId)!.condition = MAX_CONDITION
        }),
      )
    }
    case 'buyMod': {
      const check = checkBuyMod(state, action.modId)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.credits -= MOD_DEFS[action.modId].price
          draft.modInventory[action.modId] = (draft.modInventory[action.modId] ?? 0) + 1
        }),
      )
    }
    case 'fitMod': {
      const check = checkFitMod(state, action.machineId, action.modId)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.modInventory[action.modId] = (draft.modInventory[action.modId] ?? 0) - 1
          draft.machines.find((m) => m.id === action.machineId)!.mods[check.value] = action.modId
        }),
      )
    }
    case 'removeMod': {
      const check = checkRemoveMod(state, action.machineId, action.slot)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.modInventory[check.value] = (draft.modInventory[check.value] ?? 0) + 1
          draft.machines.find((m) => m.id === action.machineId)!.mods[action.slot] = null
        }),
      )
    }
    case 'buyStorageUpgrade': {
      const check = checkStorageUpgrade(state, action.resource)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.credits -= check.value.cost
          draft.storage[action.resource].tier = check.value.tier
        }),
      )
    }
    case 'setSellOrder': {
      const order = { minPrice: action.minPrice, reserve: action.reserve }
      const check = checkSetSellOrder(state, order)
      if (!check.ok) return check
      return ok(
        produce(state, (draft) => {
          draft.sellOrders[action.resource] = order
        }),
      )
    }
    case 'clearSellOrder':
      return ok(
        produce(state, (draft) => {
          draft.sellOrders[action.resource] = null
        }),
      )
  }
}
