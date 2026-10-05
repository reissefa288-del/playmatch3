import { FiGift, FiStar } from 'react-icons/fi'
import type { PremiumToastPayload } from '../usePremiumScreen'

type PremiumToastProps = {
  toast: PremiumToastPayload | null
  onDismiss: () => void
}

export function PremiumToast({ toast, onDismiss }: PremiumToastProps) {
  return (
    <div
      className="pm-premium-toast-host"
      aria-live="polite"
     
    >
      <>
        {toast ? (
          <div
            key={toast.id}
            className="pm-match-toast pm-match-toast--premium pm-premium-toast"
            role="status"
           
           
           
           
          >
            <div className="pm-match-toast__glow" aria-hidden />
            <span
              className="pm-match-toast__icon"
              aria-hidden
             
             
            >
              {toast.variant === 'success' ? <FiGift /> : <FiStar />}
            </span>
            <div className="pm-match-toast__body">
              <p className="pm-match-toast__title">{toast.title}</p>
              {toast.subtitle ? (
                <p className="pm-match-toast__subtitle">{toast.subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="pm-match-toast__dismiss"
              onClick={onDismiss}
              aria-label="Bildirimi kapat"
            />
          </div>
        ) : null}
      </>
    </div>
  )
}
