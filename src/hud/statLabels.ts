import { STAT_NAMES } from '../core/defs'
import type { StatName } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'
import type { StringId } from '../core/strings'

export const STAT_LABEL: Record<StatName, StringId> = {
  rate: 'stat.rate',
  efficiency: 'stat.efficiency',
  durability: 'stat.durability',
}

/** One line naming each Base Stat with its formatted value, e.g. "Rate 1 / Efficiency 1 / Durability 1". */
export function statSummary(stats: Record<StatName, number>): string {
  return STAT_NAMES.map((stat) => `${t(STAT_LABEL[stat])} ${formatNumber(stats[stat], { stat: true })}`).join(' / ')
}
