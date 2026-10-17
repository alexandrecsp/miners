import { formatNumber } from './core/format'
import { t } from './core/strings'
import { useGameStore } from './store/gameStore'

export function App() {
  const credits = useGameStore((s) => s.game.credits)
  const simClock = useGameStore((s) => s.game.simClock)
  return (
    <main className="min-h-screen p-8">
      <h1 className="font-display text-3xl text-accent">{t('app.title')}</h1>
      <p className="mt-2 text-ink">{t('app.tagline')}</p>
      <section className="mt-6 inline-flex gap-6 rounded border border-edge bg-panel p-4 shadow-glow">
        <div>
          <div className="text-alloy">{t('placeholder.credits')}</div>
          <div className="font-display text-2xl">{formatNumber(credits)}</div>
        </div>
        <div>
          <div className="text-ore">{t('placeholder.clock')}</div>
          <div className="font-display text-2xl">{formatNumber(Math.floor(simClock))}</div>
        </div>
      </section>
      <p className="mt-6 text-alloy">{t('placeholder.hint')}</p>
    </main>
  )
}
