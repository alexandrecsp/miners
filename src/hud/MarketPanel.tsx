import { useRef } from 'react'
import { RESOURCE_DEFS, RESOURCE_IDS, SELL_AMOUNTS } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'
import { checkSaleAmount, saleOutcomeAt } from '../core/queries'
import { dispatch, useGameStore } from '../store/gameStore'

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

function SellButton({ resource, amount }: { resource: ResourceId; amount: number | 'all' }) {
  const stored = useGameStore((s) => s.game.storage[resource].amount)
  const price = useGameStore((s) => s.game.market[resource])
  const units = amount === 'all' ? stored : amount
  const label = amount === 'all' ? t('hud.sellAll') : formatNumber(amount)
  const sellable = checkSaleAmount(stored, units).ok
  const preview = sellable ? saleOutcomeAt(price, resource, units).credits : 0
  return (
    <button
      type="button"
      disabled={!sellable}
      className="border border-edge px-2 py-0.5 text-xs hover:border-accent disabled:opacity-40 disabled:hover:border-edge"
      onClick={() => dispatch({ kind: 'sell', resource, amount: units })}
    >
      {label} +{formatNumber(preview)}
    </button>
  )
}

function MarketRow({ resource }: { resource: ResourceId }) {
  const price = useGameStore((s) => s.game.market[resource])
  const direction = useDirection(price)
  const def = RESOURCE_DEFS[resource]
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
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
      </div>
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-ink/60">{t('hud.sell')}</span>
        {SELL_AMOUNTS.map((amount) => (
          <SellButton key={amount} resource={resource} amount={amount} />
        ))}
        <SellButton resource={resource} amount="all" />
      </div>
    </li>
  )
}

/** The Market panel: each Resource's Market Price and Base Price. */
export function MarketPanel() {
  return (
    <section className="hud-panel">
      <h2 className="hud-panel-heading">{t('hud.market')}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {RESOURCE_IDS.map((resource) => (
          <MarketRow key={resource} resource={resource} />
        ))}
      </ul>
    </section>
  )
}
