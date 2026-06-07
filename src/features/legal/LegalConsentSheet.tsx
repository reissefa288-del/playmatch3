import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCheck, FiX } from 'react-icons/fi'
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
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-legal-sheet__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="pm-legal-sheet__viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="pm-legal-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pm-legal-sheet-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
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
            </motion.section>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
