import { MACHINE_DEFS, STAT_NAMES } from '../core/defs'
import { formatNumber } from '../core/format'
import { t } from '../core/strings'
import type { StringId } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'

const STAT_LABEL: Record<(typeof STAT_NAMES)[number], StringId> = {
  rate: 'stat.rate',
  efficiency: 'stat.efficiency',
  durability: 'stat.durability',
}

/** The Machine inspector: the selected Machine's Def name and Base Stats. */
export function MachineInspector() {
  const selectedId = useUiStore((s) => s.selectedMachineId)
  const machine = useGameStore((s) => s.game.machines.find((m) => m.id === selectedId))
  const cancel = useUiStore((s) => s.cancel)
  if (!machine) return null
  return (
    <aside className="absolute bottom-4 right-4 w-64 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t(MACHINE_DEFS[machine.defId].nameId)}</h2>
        <button type="button" onClick={cancel} className="text-xs text-ink/60 hover:text-ink">
          {t('hud.close')}
        </button>
      </div>
      <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.stats')}</h3>
      <dl className="mt-1 grid grid-cols-2 gap-y-1 text-sm">
        {STAT_NAMES.map((stat) => (
          <div key={stat} className="contents">
            <dt>{t(STAT_LABEL[stat])}</dt>
            <dd className="text-right">{formatNumber(machine.baseStats[stat], { stat: true })}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
