import { RESOURCE_DEFS, RESOURCE_IDS } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { isStorageFull, storageCap } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'

const RESOURCE_COLOR: Record<ResourceId, { text: string; bar: string }> = {
  ore: { text: 'text-ore', bar: 'bg-ore' },
  crystal: { text: 'text-crystal', bar: 'bg-crystal' },
  alloy: { text: 'text-alloy', bar: 'bg-alloy' },
}

function ResourceChip({ resource }: { resource: ResourceId }) {
  const amount = useGameStore((s) => s.game.storage[resource].amount)
  const cap = useGameStore((s) => storageCap(s.game, resource))
  const price = useGameStore((s) => s.game.market[resource])
  const full = useGameStore((s) => isStorageFull(s.game, resource))
  const fillPercent = cap > 0 ? Math.min(100, (amount / cap) * 100) : 0
  return (
    <div className="flex min-w-32 flex-col gap-0.5">
      <div className="flex items-baseline justify-between gap-2 text-xs uppercase tracking-widest">
        <span className={RESOURCE_COLOR[resource].text}>{t(RESOURCE_DEFS[resource].nameId)}</span>
        <span className="normal-case tracking-normal text-ink/60">{formatNumber(price, { price: true })}</span>
      </div>
      <div className="font-display text-sm">
        {formatNumber(amount)}
        <span className="text-xs text-ink/50">{` ${t('hud.of')} ${formatNumber(cap)}`}</span>
        {full && <span className="ml-1 text-[10px] uppercase text-danger">{t('hud.full')}</span>}
      </div>
      <div className="h-0.5 w-full bg-edge">
        <div className={`h-full ${RESOURCE_COLOR[resource].bar}`} style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  )
}

/** The HUD status bar in the top-left corner: Credits first and largest, then each Resource's amount, Storage Cap, fill, Market Price and full tag. It stops short of the top-right corner, which the leva dev panel uses. */
export function StatusBar() {
  const credits = useGameStore((s) => s.game.credits)
  return (
    <header className="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-6 border-b border-r border-edge bg-panel/90 py-2 pl-4 pr-6 shadow-glow backdrop-blur">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-widest text-accent">{t('hud.credits')}</span>
        <span className="font-display text-2xl text-accent">{formatNumber(credits)}</span>
      </div>
      <div className="h-8 w-px bg-edge" />
      {RESOURCE_IDS.map((resource) => (
        <ResourceChip key={resource} resource={resource} />
      ))}
    </header>
  )
}
