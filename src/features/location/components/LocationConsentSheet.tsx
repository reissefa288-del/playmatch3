import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiMapPin, FiX } from 'react-icons/fi'

type LocationConsentSheetProps = {
  open: boolean
  loading?: boolean
  error?: string | null
  onAccept: () => void
  onDecline: () => void
}

/** ADIM 10.3 — KVKK konum paylaşım rızası */
export function LocationConsentSheet({
  open,
  loading = false,
  error,
  onAccept,
  onDecline,
}: LocationConsentSheetProps) {
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        type="button"
        className="pm-moderation-sheet__backdrop pm-sheet-backdrop-enter"
        aria-label="Kapat"
        onClick={onDecline}
      />
      <section
        className={`pm-location-consent${reduceMotion ? '' : ' pm-sheet-modal-enter'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-location-consent-title"
      >
        <header className="pm-location-consent__head">
          <span className="pm-location-consent__icon" aria-hidden>
            <FiMapPin />
          </span>
          <div>
            <h2 id="pm-location-consent-title">Konum paylaşımı</h2>
            <p>Yakındaki oyuncuları göstermek için konumunu kullanmak istiyoruz.</p>
          </div>
          <button type="button" className="pm-report-sheet__close" onClick={onDecline} aria-label="Kapat">
            <FiX />
          </button>
        </header>

        <ul className="pm-location-consent__list">
          <li>Konum yalnızca mesafe hesabı ve yakın liste için kullanılır.</li>
          <li>Tam adres paylaşılmaz; diğer kullanıcılar yalnızca yaklaşık mesafeyi görür.</li>
          <li>İstediğin zaman profilden kapatabilirsin (KVKK md. 11).</li>
        </ul>

        {error ? <p className="pm-location-consent__error">{error}</p> : null}

        <div className="pm-location-consent__actions">
          <button type="button" className="pm-location-consent__secondary" onClick={onDecline} disabled={loading}>
            Şimdi değil
          </button>
          <button type="button" className="pm-location-consent__primary" onClick={onAccept} disabled={loading}>
            {loading ? 'Konum alınıyor…' : 'İzin ver ve aç'}
          </button>
        </div>
      </section>
    </>,
    document.body,
  )
}
