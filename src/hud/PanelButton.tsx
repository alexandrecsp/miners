import type { ReactNode } from 'react'

/** A panel button that dims when its action would fail; the click still reaches the core, which shows the reason. */
export function PanelButton({ enabled, onClick, children }: { enabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-disabled={!enabled}
      className={`border border-edge px-3 py-1 text-xs uppercase tracking-widest hover:border-accent ${enabled ? '' : 'opacity-40'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
