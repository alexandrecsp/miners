import type { UnlockDef } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'

/** An Unlock's name, with the numbers of its effect, e.g. "Storage Tier 2" or "Unlocked Area 18 × 18". */
export function unlockName(def: UnlockDef): string {
  const name = t(def.nameId)
  switch (def.effect.kind) {
    case 'storageTier':
      return `${name} ${formatNumber(def.effect.tier)}`
    case 'unlockedArea': {
      const side = formatNumber(def.effect.size)
      return `${name} ${side} × ${side}`
    }
    default:
      return name
  }
}
