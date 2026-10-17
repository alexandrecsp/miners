import { formatNumber } from './core/format'
import { t } from './core/strings'

export function App() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="font-display text-3xl text-accent">{t('app.title')}</h1>
      <p className="mt-2 text-ink">{t('app.tagline')}</p>
      <section className="mt-6 inline-flex gap-6 rounded border border-edge bg-panel p-4 shadow-glow">
        <div>
          <div className="text-alloy">{t('placeholder.credits')}</div>
          <div className="font-display text-2xl">{formatNumber(1234)}</div>
        </div>
        <div>
          <div className="text-ore">{t('placeholder.ore')}</div>
          <div className="font-display text-2xl">{formatNumber(3_400_000)}</div>
        </div>
        <div>
          <div className="text-crystal">{t('placeholder.price')}</div>
          <div className="font-display text-2xl">{formatNumber(0.85, { price: true })}</div>
        </div>
      </section>
      <p className="mt-6 text-alloy">{t('placeholder.hint')}</p>
    </main>
  )
}
