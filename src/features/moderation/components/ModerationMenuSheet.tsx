import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModerationMenuSheetProps = {
  open: boolean
  targetName: string
  onClose: () => void
  onReport: () => void
  onBlock: () => void
  blocking?: boolean
}

export function ModerationMenuSheet({
  open,
  targetName,
  onClose,
  onReport,
  onBlock,
  blocking = false,
}: ModerationMenuSheetProps) {
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
        onClick={onClose}
      />
      <section
        className={`pm-moderation-sheet${reduceMotion ? '' : ' pm-sheet-slide-up-enter'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-moderation-sheet-title"
      >
        <p id="pm-moderation-sheet-title" className="pm-moderation-sheet__title">
          {targetName}
        </p>
        <div className="pm-moderation-sheet__actions">
          <button type="button" className="pm-moderation-sheet__action" onClick={onReport}>
            Şikayet Et
          </button>
          <button
            type="button"
            className="pm-moderation-sheet__action is-danger"
            onClick={onBlock}
            disabled={blocking}
          >
            {blocking ? 'Engelleniyor…' : 'Engelle'}
          </button>
          <button type="button" className="pm-moderation-sheet__cancel" onClick={onClose}>
            İptal
          </button>
        </div>
      </section>
    </>,
    document.body,
  )
}
