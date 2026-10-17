import { MOD_DEFS } from '../core/defs'
import type { ModDef } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkBuyMod } from '../core/queries'
import { t } from '../core/strings'
import { dispatch, useGameStore } from '../store/gameStore'
import { modEffectText } from './modText'
import { PanelButton } from './PanelButton'

function ModRow({ def }: { def: ModDef }) {
  const owned = useGameStore((s) => s.game.modInventory[def.id] ?? 0)
  const blockedReason = useGameStore((s) => {
    const check = checkBuyMod(s.game, def.id)
    return check.ok ? '' : t(check.reason)
  })
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
        <span className="text-xs text-ink/60">{blockedReason}</span>
        <PanelButton enabled={blockedReason === ''} onClick={() => dispatch({ kind: 'buyMod', modId: def.id })}>
          {t('hud.buy')}
        </PanelButton>
      </div>
    </li>
  )
}

/** The Mods panel: the Mod Catalogue with prices, and the count of each Mod in the Mod Inventory. */
export function ModsPanel() {
  return (
    <aside className="absolute left-4 top-16 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.mods')}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {Object.values(MOD_DEFS).map((def) => (
          <ModRow key={def.id} def={def} />
        ))}
      </ul>
    </aside>
  )
}
