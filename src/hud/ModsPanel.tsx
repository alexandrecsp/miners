import { MOD_DEFS, unlockDef } from '../core/defs'
import type { ModDef } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkBuyMod, modLockedBy } from '../core/queries'
import { t } from '../core/strings'
import { dispatch, useGameStore } from '../store/gameStore'
import { modEffectText } from './modText'
import { PanelButton } from './PanelButton'
import { unlockName } from './unlockText'

function ModRow({ def }: { def: ModDef }) {
  const owned = useGameStore((s) => s.game.modInventory[def.id] ?? 0)
  const lockedBy = useGameStore((s) => modLockedBy(s.game, def.id))
  const failure = useGameStore((s) => {
    const check = checkBuyMod(s.game, def.id)
    return check.ok ? null : check.reason
  })
  const blockedReason = failure ? t(failure) : ''
  return (
    <li className="flex flex-col gap-0.5 border-b border-edge/40 pb-2 last:border-b-0">
      <div className="flex items-baseline justify-between">
        <span>{t(def.nameId)}</span>
        <span className="font-display">{formatNumber(def.price)}</span>
      </div>
      <div className="flex justify-between text-xs text-ink/60">
        <span>{modEffectText(def)}</span>
        <span>
          {t('hud.owned')} {formatNumber(owned)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        {lockedBy ? (
          <span className="text-xs text-ink/50">
            {t('hud.needsUnlock')} {unlockName(unlockDef(lockedBy))}
          </span>
        ) : (
          <>
            <span className="text-xs text-ink/60">{blockedReason}</span>
            <PanelButton enabled={blockedReason === ''} onClick={() => dispatch({ kind: 'buyMod', modId: def.id })}>
              {t('hud.buy')}
            </PanelButton>
          </>
        )}
      </div>
    </li>
  )
}

/** The Mods panel: the Mod Catalogue with prices, and the count of each Mod in the Mod Inventory. */
export function ModsPanel() {
  return (
    <section className="hud-panel">
      <h2 className="hud-panel-heading">{t('hud.mods')}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {Object.values(MOD_DEFS).map((def) => (
          <ModRow key={def.id} def={def} />
        ))}
      </ul>
    </section>
  )
}
