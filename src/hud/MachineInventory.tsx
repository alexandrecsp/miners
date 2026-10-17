import { useShallow } from 'zustand/react/shallow'
import { MACHINE_DEFS } from '../core/defs'
import { inventoryMachines } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { selectPlacingId, useUiStore } from '../store/uiStore'

/** The Machine Inventory: Machines owned but not placed, each with a Place button. */
export function MachineInventory() {
  const waiting = useGameStore(useShallow((s) => inventoryMachines(s.game).map((m) => ({ id: m.id, defId: m.defId }))))
  const placingId = useUiStore(selectPlacingId)
  const startPlacing = useUiStore((s) => s.startPlacing)
  return (
    <aside className="absolute bottom-4 left-4 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.inventory')}</h2>
      {waiting.length === 0 ? (
        <p className="mt-2 text-xs text-ink/60">{t('hud.inventoryEmpty')}</p>
      ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {waiting.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span>{t(MACHINE_DEFS[m.defId].nameId)}</span>
                <button
                  type="button"
                  onClick={() => startPlacing(m.id)}
                  className={`border px-3 py-1 text-xs uppercase tracking-widest ${placingId === m.id ? 'border-accent bg-accent/20 text-accent' : 'animate-pulse border-accent text-accent hover:bg-accent/20'}`}
                >
                  {t('hud.place')}
                </button>
              </li>
            ))}
          </ul>
      )}
    </aside>
  )
}
