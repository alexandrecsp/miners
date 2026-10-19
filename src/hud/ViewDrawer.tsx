import { t } from '../core/strings'
import { useUiStore } from '../store/uiStore'
import { HUD_VIEW_TABLE } from './hudViews'

/** The drawer on the right, between the status bar and the dock, showing the open HUD view's panels. */
export function ViewDrawer() {
  const view = useUiStore((s) => s.openView)
  const entry = HUD_VIEW_TABLE.find((v) => v.view === view)
  if (!entry) return null
  return (
    <aside className="absolute bottom-20 right-4 top-24 z-10 flex w-80 flex-col border border-edge bg-panel/90 shadow-glow backdrop-blur">
      <header className="flex items-center justify-between border-b border-edge p-3">
        <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t(entry.labelId)}</h2>
        <button
          type="button"
          aria-label={t('hud.close')}
          className="border border-edge px-2 text-xs hover:border-accent"
          onClick={() => useUiStore.getState().closeHudView()}
        >
          {t('hud.close')}
        </button>
      </header>
      <div className="flex flex-col gap-3 overflow-y-auto p-3">
        {entry.panels.map((Panel, i) => (
          <Panel key={i} />
        ))}
      </div>
    </aside>
  )
}
