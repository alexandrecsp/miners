import { t } from '../core/strings'
import { useUiStore } from '../store/uiStore'

/** The HUD notice: the text of the latest failure reason, shown briefly. */
export function Notice() {
  const notice = useUiStore((s) => s.notice)
  if (!notice) return null
  return (
    <div key={notice.serial} role="alert" className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 border border-ore bg-panel/90 px-4 py-2 text-sm text-ore shadow-glow">
      {t(notice.reason)}
    </div>
  )
}
