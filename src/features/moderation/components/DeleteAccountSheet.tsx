import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

const CONFIRM_TEXT = 'HESABIMI SİL'

type DeleteAccountSheetProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteAccountSheet({ open, onClose, onConfirm }: DeleteAccountSheetProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [confirmValue, setConfirmValue] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setConfirmValue('')
      setDeleting(false)
      setError(null)
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function handleDelete() {
    if (deleting || confirmValue.trim() !== CONFIRM_TEXT) return
    setDeleting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hesap silinemedi.')
      setDeleting(false)
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
        aria-labelledby="pm-delete-account-title"
      >
        <header className="pm-report-sheet__head">
          <div>
            <h2 id="pm-delete-account-title">Hesabımı Sil</h2>
            <p>Bu işlem geri alınamaz.</p>
          </div>
          <button type="button" className="pm-report-sheet__close" onClick={onClose} aria-label="Kapat">
            <FiX />
          </button>
        </header>

        <p className="pm-delete-account-sheet__warning">
          Profilin, fotoğrafların, beğenilerin, eşleşmelerin ve mesajların kalıcı olarak silinir.
          Firebase Auth hesabın kapatılır. Moderasyon şikayet kayıtları yasal saklama kapsamında
          tutulabilir.
        </p>

        <label className="pm-delete-account-sheet__confirm-label">
          <span>Onaylamak için &quot;{CONFIRM_TEXT}&quot; yaz</span>
          <input
            type="text"
            value={confirmValue}
            onChange={(event) => setConfirmValue(event.target.value)}
            autoComplete="off"
            disabled={deleting}
          />
        </label>

        {error ? <p className="pm-delete-account-sheet__warning">{error}</p> : null}

        <button
          type="button"
          className="pm-delete-account-sheet__delete"
          onClick={() => void handleDelete()}
          disabled={deleting || confirmValue.trim() !== CONFIRM_TEXT}
        >
          {deleting ? 'Hesap siliniyor…' : 'Hesabımı Kalıcı Olarak Sil'}
        </button>
      </section>
    </>,
    document.body,
  )
}
