import type { ModDef } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'
import { STAT_LABEL } from './statLabels'

/** A Mod's effect as text, e.g. "Rate x1.25" or "Efficiency +0.20". */
export function modEffectText(def: ModDef): string {
  const sign = def.kind === 'multiplier' ? 'x' : '+'
  return `${t(STAT_LABEL[def.stat])} ${sign}${formatNumber(def.value, { stat: true })}`
}
