import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import { REPORT_REASONS, type ReportReason, type ReportSource } from '../moderationTypes'

type ReportSheetProps = {
  open: boolean
  targetName: string
  source: ReportSource
  onClose: () => void
  onSubmit: (reason: ReportReason, details: string) => Promise<void>
}

export function ReportSheet({
  open,
  targetName,
  source,
  onClose,
  onSubmit,
}: ReportSheetProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0])
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setReason(REPORT_REASONS[0])
      setDetails('')
      setSubmitting(false)
      setDone(false)
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    try {
      await onSubmit(reason, details)
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        type="button"
        className="pm-moderation-sheet__backdrop pm-sheet-backdrop-enter"
        aria-label="Kapat"
        onClick={onClose}
      />
      <section
        className={`pm-report-sheet${reduceMotion ? '' : ' pm-sheet-modal-enter'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-report-sheet-title"
      >
        <header className="pm-report-sheet__head">
          <div>
            <h2 id="pm-report-sheet-title">Şikayet Et</h2>
            <p>
              {targetName} · {source === 'chat' ? 'Sohbet' : 'Profil'}
            </p>
          </div>
          <button type="button" className="pm-report-sheet__close" onClick={onClose} aria-label="Kapat">
            <FiX />
          </button>
        </header>

        {done ? (
          <p className="pm-delete-account-sheet__warning">
            Şikayetin alındı. Ekibimiz Firebase Console üzerinden inceleyecek.
          </p>
        ) : (
          <>
            <label className="pm-report-sheet__field">
              <span>Sebep</span>
              <select value={reason} onChange={(event) => setReason(event.target.value as ReportReason)}>
                {REPORT_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="pm-report-sheet__field">
              <span>Detay (isteğe bağlı)</span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Kısaca ne olduğunu anlat..."
                maxLength={500}
              />
            </label>
            <button
              type="button"
              className="pm-report-sheet__submit"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? 'Gönderiliyor…' : 'Şikayeti Gönder'}
            </button>
          </>
        )}
      </section>
    </>,
    document.body,
  )
}
