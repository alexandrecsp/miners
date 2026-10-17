import { useRef } from 'react'
import { RESOURCE_DEFS, RESOURCE_IDS } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'

type PriceDirection = 'up' | 'down' | 'flat'

const INDICATOR = {
  up: { glyph: '▲', label: 'hud.priceUp', color: 'text-accent' },
  down: { glyph: '▼', label: 'hud.priceDown', color: 'text-ink/60' },
} as const

/** Whether the price rose, fell or held against the last value this row showed. */
function useDirection(price: number): PriceDirection {
  const previous = useRef(price)
  const direction = useRef<PriceDirection>('flat')
  if (price !== previous.current) {
    direction.current = price > previous.current ? 'up' : 'down'
    previous.current = price
  }
  return direction.current
}

function MarketRow({ resource }: { resource: ResourceId }) {
  const price = useGameStore((s) => s.game.market[resource])
  const direction = useDirection(price)
  const def = RESOURCE_DEFS[resource]
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{t(def.nameId)}</span>
      <span className="flex items-baseline gap-2">
        {direction !== 'flat' && (
          <span aria-label={t(INDICATOR[direction].label)} className={INDICATOR[direction].color}>
            {INDICATOR[direction].glyph}
          </span>
        )}
        <span className="font-display">{formatNumber(price, { price: true })}</span>
        <span className="text-xs text-ink/60">
          {t('hud.basePrice')} {formatNumber(def.basePrice, { price: true })}
        </span>
      </span>
    </li>
  )
}

/** The Market panel: each Resource's Market Price and Base Price. */
export function MarketPanel() {
  return (
    <aside className="absolute bottom-4 right-4 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.market')}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {RESOURCE_IDS.map((resource) => (
          <MarketRow key={resource} resource={resource} />
        ))}
      </ul>
    </aside>
  )
}
