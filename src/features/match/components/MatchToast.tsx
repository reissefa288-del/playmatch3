import { FiHeart, FiStar } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import type { MatchToastPayload } from '../useMatchDiscover'

type MatchToastProps = {
  toast: MatchToastPayload | null
  onDismiss: () => void
}

const icons = {
  premium: FiStar,
  invite: LuGamepad2,
  warn: FiHeart,
  success: FiHeart,
} as const

export function MatchToast({ toast, onDismiss }: MatchToastProps) {
  if (!toast) return <div className="pm-match-toast-host" aria-live="polite" />

  const Icon = icons[toast.variant]

  return (
    <div className="pm-match-toast-host" aria-live="polite">
      <div
        key={toast.id}
        className={`pm-match-toast pm-match-toast--${toast.variant} pm-toast-enter`}
        role="status"
      >
        <div className="pm-match-toast__glow" aria-hidden />
        <span className="pm-match-toast__icon" aria-hidden>
          <Icon />
        </span>
        <div className="pm-match-toast__body">
          <p className="pm-match-toast__title">{toast.title}</p>
          {toast.subtitle ? <p className="pm-match-toast__subtitle">{toast.subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="pm-match-toast__dismiss"
          onClick={onDismiss}
          aria-label="Bildirimi kapat"
        />
      </div>
    </div>
  )
}
