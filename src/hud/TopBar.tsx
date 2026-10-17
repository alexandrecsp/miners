import { RESOURCE_DEFS, RESOURCE_IDS } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { storageCap } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'

const RESOURCE_COLOR: Record<ResourceId, string> = {
  ore: 'text-ore',
  crystal: 'text-crystal',
  alloy: 'text-alloy',
}

function ResourceReadout({ resource }: { resource: ResourceId }) {
  const amount = useGameStore((s) => s.game.storage[resource].amount)
  const cap = useGameStore((s) => storageCap(s.game, resource))
  const price = useGameStore((s) => s.game.market[resource])
  return (
    <div className="flex flex-col">
      <span className={`text-xs uppercase tracking-widest ${RESOURCE_COLOR[resource]}`}>{t(RESOURCE_DEFS[resource].nameId)}</span>
      <span className="font-display text-lg">
        {formatNumber(amount)}
        <span className="text-sm text-ink/60">
          {` ${t('hud.of')} `}
          {formatNumber(cap)}
        </span>
      </span>
      <span className="text-xs text-ink/70">
        {t('hud.price')} {formatNumber(price, { price: true })}
      </span>
    </div>
  )
}

/** The HUD top bar: Credits and, per Resource, amount, Storage Cap and Market Price. */
export function TopBar() {
  const credits = useGameStore((s) => s.game.credits)
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-8 border-b border-edge bg-panel/80 px-6 py-3 shadow-glow backdrop-blur">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-widest text-accent">{t('hud.credits')}</span>
        <span className="font-display text-2xl">{formatNumber(credits)}</span>
      </div>
      {RESOURCE_IDS.map((resource) => (
        <ResourceReadout key={resource} resource={resource} />
      ))}
    </header>
  )
}
