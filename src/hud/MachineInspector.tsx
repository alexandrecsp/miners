import { MACHINE_DEFS, STAT_NAMES } from '../core/defs'
import type { StatName } from '../core/defs'
import { formatNumber } from '../core/format'
import { effectiveStats, machineStatus, recipeOf } from '../core/queries'
import type { MachineStatus } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { STAT_LABEL } from './statLabels'

function StatList({ stats }: { stats: Record<StatName, number> }) {
  return (
    <dl className="mt-1 grid grid-cols-2 gap-y-1 text-sm">
      {STAT_NAMES.map((stat) => (
        <div key={stat} className="contents">
          <dt>{t(STAT_LABEL[stat])}</dt>
          <dd className="text-right">{formatNumber(stats[stat], { stat: true })}</dd>
        </div>
      ))}
    </dl>
  )
}

function statusText(status: MachineStatus): string {
  switch (status.kind) {
    case 'inventory':
      return t('status.inventory')
    case 'working':
      return t('status.working')
    case 'idle':
      return t(`idle.${status.reason}`)
  }
}

/** The Machine inspector: the selected Machine's Def name and Base Stats. */
export function MachineInspector() {
  const selectedId = useUiStore((s) => s.selectedMachineId)
  const machine = useGameStore((s) => s.game.machines.find((m) => m.id === selectedId))
  const cancel = useUiStore((s) => s.cancel)
  const startMoving = useUiStore((s) => s.startMoving)
  const moving = useUiStore((s) => s.mode.kind === 'moving')
  const status = useGameStore((s) => (selectedId ? statusText(machineStatus(s.game, selectedId)) : ''))
  if (!machine) return null
  const effective = effectiveStats(machine)
  const recipe = recipeOf(machine)
  return (
    <aside className="absolute bottom-4 right-4 w-64 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t(MACHINE_DEFS[machine.defId].nameId)}</h2>
        <button type="button" onClick={cancel} className="text-xs text-ink/60 hover:text-ink">
          {t('hud.close')}
        </button>
      </div>
      <p className="mt-2 text-sm">
        <span className="text-xs uppercase tracking-widest text-ink/60">{t('hud.status')}</span>{' '}
        {status}
      </p>
      {recipe && (
        <p className="mt-1 text-sm">
          <span className="text-xs uppercase tracking-widest text-ink/60">{t('hud.recipe')}</span> {t(recipe.nameId)}
        </p>
      )}
      <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.effectiveStats')}</h3>
      <StatList stats={effective} />
      <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.stats')}</h3>
      <StatList stats={machine.baseStats} />
      {machine.tile && (
        <button
          type="button"
          onClick={() => startMoving(machine.id)}
          className={`mt-3 border px-3 py-1 text-xs uppercase tracking-widest ${moving ? 'border-accent bg-accent/20 text-accent' : 'border-accent text-accent hover:bg-accent/20'}`}
        >
          {t('hud.move')}
        </button>
      )}
    </aside>
  )
}
