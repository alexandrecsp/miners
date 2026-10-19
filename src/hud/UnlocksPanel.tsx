import { formatNumber } from '../core/format'
import { earnedUnlocks, unlockProgress } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { unlockName } from './unlockText'

/** The Unlocks panel: the earned Unlocks, and the unearned ones with their Lifetime Counter progress. */
export function UnlocksPanel() {
  const lifetime = useGameStore((s) => s.game.lifetime)
  const unlocks = useGameStore((s) => s.game.unlocks)
  const earned = earnedUnlocks({ unlocks })
  const next = unlockProgress({ lifetime, unlocks })
  return (
    <aside className="absolute left-80 top-16 w-72 border border-edge bg-panel/85 p-3 shadow-glow backdrop-blur">
      <h2 className="font-display text-sm uppercase tracking-widest text-accent">{t('hud.unlocks')}</h2>
      {earned.length > 0 && (
        <>
          <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.unlocksEarned')}</h3>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {earned.map((def) => (
              <li key={def.id}>{unlockName(def)}</li>
            ))}
          </ul>
        </>
      )}
      <h3 className="mt-2 text-xs uppercase tracking-widest text-ink/60">{t('hud.unlocksNext')}</h3>
      <ul className="mt-1 flex flex-col gap-2">
        {next.map(({ def, value }) => (
          <li key={def.id} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between text-sm">
              <span>{unlockName(def)}</span>
              <span className="text-xs text-ink/70">
                {formatNumber(value)} {t('hud.of')} {formatNumber(def.threshold)}
              </span>
            </div>
            <progress className="h-1 w-full" value={Math.min(value, def.threshold)} max={def.threshold} />
          </li>
        ))}
      </ul>
    </aside>
  )
}
