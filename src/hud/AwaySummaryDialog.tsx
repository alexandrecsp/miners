import { MACHINE_DEFS, OFFLINE, RESOURCE_DEFS, unlockDef } from '../core/defs'
import type { ResourceId } from '../core/defs'
import { formatDuration, formatNumber } from '../core/format'
import { t, tf } from '../core/strings'
import type { StringId } from '../core/strings'
import type { Tile } from '../core/types'
import type { ReactNode } from 'react'
import { useUiStore } from '../store/uiStore'
import { unlockName } from './unlockText'

/** The parts of a row joined into one line, or null when there are none, so the row is left out. */
function joinedLine(parts: string[]): string | null {
  return parts.length > 0 ? parts.join(' Â· ') : null
}

/** "Ore 120 Â· Alloy 4" for the Resources that changed, or null when none did. */
function resourceLine(amounts: Partial<Record<ResourceId, number>>): string | null {
  return joinedLine(
    (Object.entries(amounts) as [ResourceId, number][])
      .filter(([, amount]) => amount > 0)
      .map(([resource, amount]) => `${t(RESOURCE_DEFS[resource].nameId)} ${formatNumber(amount)}`),
  )
}

/**
 * "Drill at (3, 7), (4, 8) Â· Ore at (12, 4)": which things are meant, grouped by name with the Tile of each, or null
 * when there are none. A thing without a Tile shows by its name alone.
 */
function placesLine(things: { name: string; tile: Tile | null }[]): string | null {
  const tilesByName = new Map<string, string[]>()
  for (const { name, tile } of things) {
    const tiles = tilesByName.get(name) ?? []
    if (tile) tiles.push(tf('hud.tile', { x: formatNumber(tile.x), y: formatNumber(tile.y) }))
    tilesByName.set(name, tiles)
  }
  return joinedLine(
    [...tilesByName].map(([name, tiles]) => (tiles.length > 0 ? tf('hud.awayAtTiles', { name, tiles: tiles.join(', ') }) : name)),
  )
}

function Row({ label, children }: { label: StringId; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-ink/60">{t(label)}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

/** The Away Summary as a dismissable dialog: the time replayed and what Offline Progress mined, refined, sold, broke and unlocked. */
export function AwaySummaryDialog() {
  const summary = useUiStore((s) => s.awaySummary)
  const dismiss = useUiStore((s) => s.dismissAwaySummary)
  if (!summary) return null
  const mined = resourceLine(summary.mined)
  const refined = resourceLine(summary.refined)
  const sold = resourceLine(summary.sold)
  const broken = placesLine(summary.brokenMachines.map(({ defId, tile }) => ({ name: t(MACHINE_DEFS[defId].nameId), tile })))
  const depleted = placesLine(summary.depletedDeposits.map(({ resource, tile }) => ({ name: t(RESOURCE_DEFS[resource].nameId), tile })))
  const credits = summary.creditsEarned > 0 ? formatNumber(summary.creditsEarned) : null
  const unlocks = joinedLine(summary.unlocks.map((id) => unlockName(unlockDef(id))))
  const rows = (
    [
      ['hud.awayMined', mined],
      ['hud.awayRefined', refined],
      ['hud.awaySold', sold],
      ['hud.awayCreditsEarned', credits],
      ['hud.awayBroken', broken],
      ['hud.awayDepleted', depleted],
      ['hud.awayUnlocks', unlocks],
    ] as [StringId, string | null][]
  ).filter((row): row is [StringId, string] => row[1] !== null)
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-void/60">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="away-summary-title"
        className="w-96 border border-accent bg-panel/95 p-4 shadow-glow"
      >
        <h2 id="away-summary-title" className="font-display text-sm uppercase tracking-widest text-accent">
          {t('hud.awaySummary')}
        </h2>
        <p className="mt-1 text-sm">
          {tf('hud.awayReplayed', formatDuration(summary.seconds))}
        </p>
        {summary.capped && <p className="mt-1 text-xs text-ore">{tf('hud.awayCapped', { hours: formatDuration(OFFLINE.cap).hours })}</p>}
        {rows.length > 0 ? (
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            {rows.map(([label, text]) => (
              <Row key={label} label={label}>
                {text}
              </Row>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-ink/60">{t('hud.awayNothing')}</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="border border-edge px-3 py-1 text-xs uppercase tracking-widest hover:border-accent"
            onClick={dismiss}
          >
            {t('hud.close')}
          </button>
        </div>
      </section>
    </div>
  )
}
