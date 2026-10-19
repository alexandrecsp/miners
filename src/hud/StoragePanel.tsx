import { useShallow } from 'zustand/react/shallow'
import { RESOURCE_DEFS, RESOURCE_IDS, unlockDef } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkStorageUpgrade, nextStorageUpgrade, storageCap } from '../core/queries'
import { t } from '../core/strings'
import { dispatch, useGameStore } from '../store/gameStore'
import { PanelButton } from './PanelButton'
import { unlockName } from './unlockText'

function StorageRow({ resource }: { resource: ResourceId }) {
  const amount = useGameStore((s) => s.game.storage[resource].amount)
  const cap = useGameStore((s) => storageCap(s.game, resource))
  const upgrade = useGameStore(useShallow((s) => nextStorageUpgrade(s.game, resource)))
  const buyable = useGameStore((s) => checkStorageUpgrade(s.game, resource).ok)
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span>{t(RESOURCE_DEFS[resource].nameId)}</span>
        <span className="font-display">
          {formatNumber(amount)}
          <span className="text-xs text-ink/60">
            {` ${t('hud.of')} `}
            {formatNumber(cap)}
          </span>
        </span>
      </div>
      {upgrade ? (
        <div className="flex items-center justify-between gap-2 text-xs text-ink/70">
          <span>
            {t('hud.storageNextTier')} {formatNumber(upgrade.tier)}: {formatNumber(upgrade.cap)}
          </span>
          {upgrade.unlocked ? (
            <PanelButton enabled={buyable} onClick={() => dispatch({ kind: 'buyStorageUpgrade', resource })}>
              {t('hud.storageUpgrade')} {formatNumber(upgrade.cost)}
            </PanelButton>
          ) : (
            <span className="text-ink/50">
              {t('hud.needsUnlock')} {unlockName(unlockDef(upgrade.unlockId))} · {formatNumber(upgrade.cost)}
            </span>
          )}
        </div>
      ) : (
        <span className="text-xs text-ink/60">{t('hud.storageMaxTier')}</span>
      )}
    </li>
  )
}

/** The Storage panel: per Resource, the amount, the Storage Cap and the next Storage Upgrade, or the Unlock it waits for. */
export function StoragePanel() {
  return (
    <aside className="absolute right-80 top-16 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.storage')}</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {RESOURCE_IDS.map((resource) => (
          <StorageRow key={resource} resource={resource} />
        ))}
      </ul>
    </aside>
  )
}
