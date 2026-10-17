import type { Draft } from 'immer'
import { MACHINE_DEFS, SHOP, STARTING_CONDITION, STAT_NAMES } from './defs'
import type { MachineDefId, StatName } from './defs'
import { nextId } from './ids'
import { offerPrice, rollQuality } from './queries'
import type { Rng } from './rng'
import type { GameState, Machine, Offer } from './types'

/** An unplaced Machine at full Condition with the given Base Stats and empty Mod slots. */
export function buildMachine(id: string, defId: MachineDefId, baseStats: Record<StatName, number>): Machine {
  return {
    id,
    defId,
    baseStats,
    condition: STARTING_CONDITION,
    lifetimeWear: 0,
    mods: Array.from({ length: MACHINE_DEFS[defId].modSlots }, () => null),
    tile: null,
  }
}

/** Stat Roll: each Base Stat drawn uniformly within its Machine Def's range. */
function rollMachine(rng: Rng, defId: MachineDefId, id: string): Machine {
  const baseStats = {} as Record<StatName, number>
  for (const stat of STAT_NAMES) {
    const { min, max } = MACHINE_DEFS[defId].stats[stat]
    baseStats[stat] = min + rng.next() * (max - min)
  }
  return buildMachine(id, defId, baseStats)
}

function availableDefIds(): MachineDefId[] {
  return (Object.keys(MACHINE_DEFS) as MachineDefId[]).filter((id) => MACHINE_DEFS[id].availableAtStart)
}

/** Replaces the Shop Stock: one Offer of each available Machine Def, the rest drawn at random from them. */
export function fillShop(draft: Draft<GameState>, rng: Rng): void {
  const available = availableDefIds()
  const defIds = [...available]
  while (defIds.length < SHOP.offers) defIds.push(available[Math.floor(rng.next() * available.length)]!)
  draft.shop.offers = defIds.map((defId): Offer => {
    const machine = rollMachine(rng, defId, nextId(draft, 'm'))
    return { machine, price: offerPrice(defId, rollQuality(machine)) }
  })
}

/** Shop timer system: when the sim clock passes the next timed Shop Refresh, replaces the Stock and schedules the next. */
export function shopTimer(draft: Draft<GameState>, _dt: number, rng: Rng): void {
  if (draft.simClock < draft.shop.nextRefresh) return
  fillShop(draft, rng)
  while (draft.shop.nextRefresh <= draft.simClock) draft.shop.nextRefresh += SHOP.interval
}
