import { isBroken, MACHINE_DEFS, MOD_DEFS, RECIPE_DEFS, recipeInputs, RESOURCE_DEFS, STAT_NAMES } from '../core/defs'
import type { ModDefId, RecipeDef, StatName } from '../core/defs'
import { formatNumber } from '../core/format'
import { checkFitMod, checkRemoveMod, checkRepair, effectiveStats, machineStatus, recipeOf, repairCost as repairCostOf } from '../core/queries'
import type { MachineStatus } from '../core/queries'
import { t } from '../core/strings'
import type { StringId } from '../core/strings'
import { dispatch, useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { modEffectText } from './modText'
import { STAT_LABEL } from './statLabels'

function StatCompare({ base, effective }: { base: Record<StatName, number>; effective: Record<StatName, number> }) {
  return (
    <dl className="mt-1 grid grid-cols-3 gap-y-1 text-sm">
      <dt className="text-xs uppercase tracking-widest text-ink/60" />
      <dd className="text-right text-xs uppercase tracking-widest text-ink/60">{t('hud.stats')}</dd>
      <dd className="text-right text-xs uppercase tracking-widest text-ink/60">{t('hud.effectiveStats')}</dd>
      {STAT_NAMES.map((stat) => (
        <div key={stat} className="contents">
          <dt>{t(STAT_LABEL[stat])}</dt>
          <dd className="text-right text-ink/60">{formatNumber(base[stat], { stat: true })}</dd>
          <dd className="text-right">{formatNumber(effective[stat], { stat: true })}</dd>
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
    case 'broken':
      return t('status.broken')
    case 'idle':
      return t(`idle.${status.reason}`)
  }
}

function recipeSummary(recipe: RecipeDef): string {
  const inputs = recipeInputs(recipe)
    .map(([resource, amount]) => `${formatNumber(amount)} ${t(RESOURCE_DEFS[resource].nameId)}`)
    .join(' + ')
  return `${inputs} → ${formatNumber(recipe.outputAmount)} ${t(RESOURCE_DEFS[recipe.output].nameId)}`
}

/** The Machine inspector: the selected Machine's Def name and Base Stats. */
export function MachineInspector() {
  const selectedId = useUiStore((s) => s.selectedMachineId)
  const machine = useGameStore((s) => s.game.machines.find((m) => m.id === selectedId))
  const cancel = useUiStore((s) => s.cancel)
  const startMoving = useUiStore((s) => s.startMoving)
  const moving = useUiStore((s) => s.mode.kind === 'moving')
  const status = useGameStore((s) => (selectedId ? statusText(machineStatus(s.game, selectedId)) : ''))
  const repairCheck = useGameStore((s) => {
    const check = selectedId ? checkRepair(s.game, selectedId) : undefined
    return check ? (check.ok ? `ok:${check.value}` : check.reason) : ''
  })
  const modInventory = useGameStore((s) => s.game.modInventory)
  if (!machine) return null
  const repairCost = repairCheck.startsWith('ok:') ? Number(repairCheck.slice(3)) : repairCostOf(machine)
  const repairBlocked = repairCheck.startsWith('ok:') ? undefined : (repairCheck as StringId)
  const effective = effectiveStats(machine)
  const ownedMods = (Object.keys(MOD_DEFS) as ModDefId[]).filter((id) => (modInventory[id] ?? 0) > 0)
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
      <div className="mt-2">
        <div className="flex justify-between text-xs uppercase tracking-widest text-ink/60">
          <span>{t('hud.condition')}</span>
          <span>{formatNumber(machine.condition)}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={t('hud.condition')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(machine.condition)}
          className="mt-1 h-2 w-full border border-edge"
        >
          <div
            className={`h-full ${isBroken(machine.condition) ? 'bg-danger' : 'bg-accent'}`}
            style={{ width: `${machine.condition}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-ink/60">
          {t('hud.lifetimeWear')} {formatNumber(machine.lifetimeWear)}
        </p>
      </div>
      <div className="mt-2">
        <button
          type="button"
          disabled={repairBlocked !== undefined}
          title={repairBlocked ? t(repairBlocked) : undefined}
          onClick={() => dispatch({ kind: 'repair', machineId: machine.id })}
          className="border border-accent px-3 py-1 text-xs uppercase tracking-widest text-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {t('hud.repair')} ({formatNumber(repairCost)})
        </button>
        {repairBlocked && <p className="mt-1 text-xs text-ink/60">{t(repairBlocked)}</p>}
      </div>
      {recipe && (
        <div className="mt-2">
          <h3 className="text-xs uppercase tracking-widest text-ink/60">{t('hud.recipe')}</h3>
          <div className="mt-1 flex flex-col gap-1">
            {Object.values(RECIPE_DEFS).map((def) => (
              <button
                key={def.id}
                type="button"
                aria-pressed={def.id === recipe.id}
                onClick={() => dispatch({ kind: 'setRecipe', machineId: machine.id, recipeId: def.id })}
                className={`border px-2 py-1 text-left text-xs ${def.id === recipe.id ? 'border-accent bg-accent/20 text-accent' : 'border-edge hover:border-accent'}`}
              >
                <span className="block uppercase tracking-widest">{t(def.nameId)}</span>
                <span className="block text-ink/60">{recipeSummary(def)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <StatCompare base={machine.baseStats} effective={effective} />
      <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.modSlots')}</h3>
      <ul className="mt-1 flex flex-col gap-1 text-sm">
        {machine.mods.map((fitted, index) => (
          <li key={index} className="border border-edge/40 px-2 py-1">
            {fitted !== null && Object.hasOwn(MOD_DEFS, fitted) ? (
              <span className="flex items-center justify-between gap-2">
                <span>
                  {t(MOD_DEFS[fitted as ModDefId].nameId)}{' '}
                  <span className="text-xs text-ink/60">{modEffectText(MOD_DEFS[fitted as ModDefId])}</span>
                </span>
                <button
                  type="button"
                  disabled={!checkRemoveMod({ machines: [machine] }, machine.id, index).ok}
                  onClick={() => dispatch({ kind: 'removeMod', machineId: machine.id, slot: index })}
                  className="border border-edge px-2 py-0.5 text-xs uppercase tracking-widest hover:border-accent"
                >
                  {t('hud.remove')}
                </button>
              </span>
            ) : (
              <span className="text-ink/60">{t('hud.modSlotEmpty')}</span>
            )}
          </li>
        ))}
      </ul>
      {ownedMods.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          {ownedMods.map((id) => {
            const check = checkFitMod({ machines: [machine], modInventory }, machine.id, id)
            if (!check.ok && check.reason === 'fail.modDoesNotFit') return null
            return (
              <button
                key={id}
                type="button"
                aria-disabled={!check.ok}
                title={check.ok ? undefined : t(check.reason)}
                onClick={() => dispatch({ kind: 'fitMod', machineId: machine.id, modId: id })}
                className={`border border-edge px-2 py-1 text-left text-xs hover:border-accent ${check.ok ? '' : 'opacity-40'}`}
              >
                <span className="uppercase tracking-widest">{t('hud.fit')}</span> {t(MOD_DEFS[id].nameId)} ({formatNumber(modInventory[id] ?? 0)})
              </button>
            )
          })}
        </div>
      )}
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
