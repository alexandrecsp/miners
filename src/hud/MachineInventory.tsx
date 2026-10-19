import { useShallow } from 'zustand/react/shallow'
import { MACHINE_DEFS } from '../core/defs'
import { inventoryMachines } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { statSummary } from './statLabels'
import { selectPlacingId, useUiStore } from '../store/uiStore'

/** One unplaced Machine: selects only the fields it shows, by id. */
function InventoryRow({ id }: { id: string }) {
  const defId = useGameStore((s) => s.game.machines.find((m) => m.id === id)!.defId)
  const baseStats = useGameStore((s) => s.game.machines.find((m) => m.id === id)!.baseStats)
  const placing = useUiStore((s) => selectPlacingId(s) === id)
  const startPlacing = useUiStore((s) => s.startPlacing)
  return (
    <li className="flex items-center justify-between">
      <div className="flex flex-col">
        <span>{t(MACHINE_DEFS[defId].nameId)}</span>
        <span className="text-xs text-ink/60">{statSummary(baseStats)}</span>
      </div>
      <button
        type="button"
        onClick={() => startPlacing(id)}
        className={`border px-3 py-1 text-xs uppercase tracking-widest ${placing ? 'border-accent bg-accent/20 text-accent' : 'animate-pulse border-accent text-accent hover:bg-accent/20'}`}
      >
        {t('hud.place')}
      </button>
    </li>
  )
}

/** The Machine Inventory: Machines owned but not placed, each with a Place button. */
export function MachineInventory() {
  const waitingIds = useGameStore(useShallow((s) => inventoryMachines(s.game).map((m) => m.id)))
  return (
    <section className="hud-panel">
      <h2 className="hud-panel-heading">{t('hud.inventory')}</h2>
      {waitingIds.length === 0 ? (
        <p className="mt-2 text-xs text-ink/60">{t('hud.inventoryEmpty')}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {waitingIds.map((id) => (
            <InventoryRow key={id} id={id} />
          ))}
        </ul>
      )}
    </section>
  )
}
