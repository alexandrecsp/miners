import { useState } from 'react'
import { RESOURCE_DEFS, RESOURCE_IDS } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkSetSellOrder, isUnlocked } from '../core/queries'
import { t, tf } from '../core/strings'
import { dispatch, useGameStore } from '../store/gameStore'
import { PanelButton } from './PanelButton'

const INPUT_CLASS = 'w-16 border border-edge bg-void/60 px-1 py-0.5 text-xs text-ink'

/** An input's text as a number; an empty field is NaN, so the core's check rejects it. */
function parseInput(text: string): number {
  return text.trim() === '' ? NaN : Number(text)
}

function SellOrderRow({ resource }: { resource: ResourceId }) {
  const order = useGameStore((s) => s.game.sellOrders[resource])
  const unlocks = useGameStore((s) => s.game.unlocks)
  const [minPrice, setMinPrice] = useState('')
  const [reserve, setReserve] = useState('')
  const pendingOrder = { minPrice: parseInput(minPrice), reserve: parseInput(reserve) }
  const check = checkSetSellOrder({ unlocks }, pendingOrder)
  /** Why the pending order cannot be set; empty when it can. */
  const blockedReason = check.ok ? '' : t(check.reason)
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span>{t(RESOURCE_DEFS[resource].nameId)}</span>
        <span className="text-xs text-ink/70">
          {order
            ? tf('hud.sellOrderTerms', { minPrice: formatNumber(order.minPrice, { price: true }), reserve: formatNumber(order.reserve) })
            : t('hud.noSellOrder')}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-ink/70">
        <input
          type="number"
          min="0"
          step="0.01"
          aria-label={t('hud.minPrice')}
          placeholder={t('hud.minPrice')}
          className={INPUT_CLASS}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          min="0"
          aria-label={t('hud.reserve')}
          placeholder={t('hud.reserve')}
          className={INPUT_CLASS}
          value={reserve}
          onChange={(e) => setReserve(e.target.value)}
        />
        <PanelButton enabled={blockedReason === ''} onClick={() => dispatch({ kind: 'setSellOrder', resource, ...pendingOrder })}>
          {t('hud.setSellOrder')}
        </PanelButton>
        <PanelButton enabled={order !== null} onClick={() => dispatch({ kind: 'clearSellOrder', resource })}>
          {t('hud.clearSellOrder')}
        </PanelButton>
      </div>
      <span className="text-xs text-ink/60">{blockedReason}</span>
    </li>
  )
}

/** The Sell Orders panel, shown once the Sell Orders Unlock is earned: per Resource, its Sell Order and the inputs to set or clear it. */
export function SellOrdersPanel() {
  const unlocked = useGameStore((s) => isUnlocked(s.game, 'sellOrders'))
  if (!unlocked) return null
  return (
    <section className="hud-panel">
      <h2 className="hud-panel-heading">{t('hud.sellOrders')}</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {RESOURCE_IDS.map((resource) => (
          <SellOrderRow key={resource} resource={resource} />
        ))}
      </ul>
    </section>
  )
}
