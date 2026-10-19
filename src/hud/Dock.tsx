import { inventoryMachines } from '../core/queries'
import { t } from '../core/strings'
import { formatNumber } from '../core/format'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { HUD_VIEW_TABLE } from './hudViews'
import type { HudViewEntry } from './hudViews'

/** The number of Machines in the Machine Inventory, shown on the Machines button. */
function InventoryBadge() {
  const count = useGameStore((s) => inventoryMachines(s.game).length)
  if (count === 0) return null
  return <span className="border border-accent px-1 text-accent">{formatNumber(count)}</span>
}

function DockButton({ entry: { view, labelId, hotkey } }: { entry: HudViewEntry }) {
  const open = useUiStore((s) => s.openView === view)
  return (
    <button
      type="button"
      aria-pressed={open}
      className={`flex items-center gap-2 border px-3 py-1 text-xs uppercase tracking-widest hover:border-accent ${open ? 'border-accent text-accent shadow-glow' : 'border-edge'}`}
      onClick={() => useUiStore.getState().toggleHudView(view)}
    >
      <span className="font-display text-ink/60">{formatNumber(hotkey)}</span>
      {t(labelId)}
      {view === 'machines' && <InventoryBadge />}
    </button>
  )
}

/** The dock at the bottom centre: one button per HUD view, the open one highlighted. */
export function Dock() {
  return (
    <nav className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 border border-edge bg-panel/85 p-2 backdrop-blur">
      {HUD_VIEW_TABLE.map((entry) => (
        <DockButton key={entry.view} entry={entry} />
      ))}
    </nav>
  )
}
