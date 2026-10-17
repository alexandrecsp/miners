import { useShallow } from 'zustand/react/shallow'
import { MACHINE_DEFS, SHOP, STAT_NAMES } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkBuyOffer, checkShopRefresh, shopCountdown } from '../core/queries'
import { t } from '../core/strings'
import type { Offer } from '../core/types'
import { dispatch, useGameStore } from '../store/gameStore'
import { PanelButton } from './PanelButton'
import { STAT_LABEL } from './statLabels'

function OfferRow({ offer }: { offer: Offer }) {
  /** Why the Offer cannot be bought; empty when it can. */
  const blockedReason = useGameStore((s) => {
    const check = checkBuyOffer(s.game, offer.machine.id)
    return check.ok ? '' : t(check.reason)
  })
  const buyable = blockedReason === ''
  const def = MACHINE_DEFS[offer.machine.defId]
  return (
    <li className="flex flex-col gap-0.5 border-b border-edge/40 pb-2 last:border-b-0">
      <div className="flex items-baseline justify-between">
        <span>{t(def.nameId)}</span>
        <span className="font-display">{formatNumber(offer.price)}</span>
      </div>
      {STAT_NAMES.map((stat) => (
        <div key={stat} className="flex justify-between text-xs text-ink/60">
          <span>{t(STAT_LABEL[stat])}</span>
          <span>
            <span className="text-ink">{formatNumber(offer.machine.baseStats[stat], { stat: true })}</span>{' '}
            ({formatNumber(def.stats[stat].min, { stat: true })} - {formatNumber(def.stats[stat].max, { stat: true })})
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-xs text-ink/60">{blockedReason}</span>
        <PanelButton enabled={buyable} onClick={() => dispatch({ kind: 'buyOffer', machineId: offer.machine.id })}>
          {t('hud.buy')}
        </PanelButton>
      </div>
    </li>
  )
}

/** The Shop panel: the Offers, the countdown to the next timed Shop Refresh and the paid refresh button. */
export function ShopPanel() {
  const offers = useGameStore(useShallow((s) => s.game.shop.offers))
  const countdown = useGameStore((s) => Math.ceil(shopCountdown(s.game)))
  const refreshable = useGameStore((s) => checkShopRefresh(s.game).ok)
  return (
    <aside className="absolute right-4 top-16 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.shop')}</h2>
      <p className="mt-1 text-xs text-ink/60">
        {t('hud.shopRefreshIn')} {formatNumber(countdown)}
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {offers.map((offer) => (
          <OfferRow key={offer.machine.id} offer={offer} />
        ))}
      </ul>
      <div className="mt-2">
        <PanelButton enabled={refreshable} onClick={() => dispatch({ kind: 'refreshShop' })}>
          {t('hud.shopRefresh')} {formatNumber(SHOP.refreshCost)}
        </PanelButton>
      </div>
    </aside>
  )
}
