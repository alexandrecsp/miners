import { unlockDef } from '../core/defs'
import { t } from '../core/strings'
import { useUiStore } from '../store/uiStore'
import { unlockName } from './unlockText'

const NOTICE_FRAME = 'pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 border bg-panel/90 px-4 py-2 shadow-glow'

/** The HUD notice, shown briefly: a failure reason, or an earned Unlock in the accent colour. */
export function Notice() {
  const notice = useUiStore((s) => s.notice)
  if (!notice) return null
  if (notice.kind === 'failure') {
    return (
      <div key={notice.serial} role="alert" className={`${NOTICE_FRAME} border-ore text-sm text-ore`}>
        {t(notice.reason)}
      </div>
    )
  }
  return (
    <div key={notice.serial} role="status" className={`${NOTICE_FRAME} border-accent text-center`}>
      <div className="text-xs uppercase tracking-widest text-accent/70">{t('hud.unlockEarned')}</div>
      <div className="text-sm text-accent">{unlockName(unlockDef(notice.unlockId))}</div>
    </div>
  )
}
