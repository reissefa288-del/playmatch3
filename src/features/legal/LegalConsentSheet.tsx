import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiX } from 'react-icons/fi'
import { usePrefersReducedMotion } from '../../shared/usePrefersReducedMotion'
import { LegalDocumentBody } from './LegalDocumentBody'
import type { LegalDocument } from './types'

type LegalConsentSheetProps = {
  open: boolean
  legalDocument: LegalDocument
  accepted: boolean
  onClose: () => void
  onAccept: () => void
  onRevoke: () => void
}

export function LegalConsentSheet({
  open,
  legalDocument,
  accepted,
  onClose,
  onAccept,
  onRevoke,
}: LegalConsentSheetProps) {
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <>
      <button
        type="button"
        className="pm-legal-sheet__backdrop pm-sheet-backdrop-enter"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="pm-legal-sheet__viewport pm-sheet-viewport-enter">
        <section
          className={`pm-legal-sheet${reduceMotion ? '' : ' pm-sheet-slide-up-enter'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-legal-sheet-title"
        >
          <header className="pm-legal-sheet__header">
            <div className="pm-legal-sheet__header-text">
              <h2 id="pm-legal-sheet-title">{legalDocument.title}</h2>
              <p>{legalDocument.subtitle}</p>
            </div>
            <button type="button" className="pm-legal-sheet__close" aria-label="Kapat" onClick={onClose}>
              <FiX aria-hidden />
            </button>
          </header>

          <div className="pm-legal-sheet__scroll">
            <LegalDocumentBody legalDocument={legalDocument} className="pm-legal-sheet__body" />
          </div>

          <footer className="pm-legal-sheet__footer">
            {accepted ? (
              <div className="pm-legal-sheet__accepted">
                <FiCheck aria-hidden />
                <span>Onaylandı</span>
              </div>
            ) : null}

            {!accepted ? (
              <button type="button" className="pm-legal-sheet__accept" onClick={onAccept}>
                Okudum, anladım ve onaylıyorum
              </button>
            ) : (
              <div className="pm-legal-sheet__footer-actions">
                <button type="button" className="pm-legal-sheet__accept is-muted" onClick={onClose}>
                  Kapat
                </button>
                <button type="button" className="pm-legal-sheet__revoke" onClick={onRevoke}>
                  Onayı kaldır
                </button>
              </div>
            )}
          </footer>
        </section>
      </div>
    </>,
    document.body,
  )
}
