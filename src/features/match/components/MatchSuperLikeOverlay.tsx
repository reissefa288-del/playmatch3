import { useEffect } from 'react'
import type { MatchProfile } from '../data'
import actionSuper from '../assets/action-super.png'

type MatchSuperLikeOverlayProps = {
  profile: MatchProfile
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function MatchSuperLikeOverlay({
  profile,
  open,
  onClose,
  onConfirm,
}: MatchSuperLikeOverlayProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="pm-superlike-overlay" role="dialog" aria-modal="true" aria-label="Süper beğeni">
      <button type="button" className="pm-superlike-overlay__backdrop" aria-label="Kapat" onClick={onClose} />
      <div className="pm-superlike-overlay__panel">
        <div className="pm-superlike-overlay__glow" aria-hidden />
        <div className="pm-superlike-overlay__star-wrap" aria-hidden>
          <img src={actionSuper} alt="" width={120} height={120} draggable={false} />
        </div>
        <div className="pm-superlike-overlay__photo">
          <img src={profile.portraitSrc} alt="" draggable={false} />
        </div>
        <p className="pm-superlike-overlay__stamp" aria-hidden>
          SUPER LIKE
        </p>
        <h2 className="pm-superlike-overlay__title">{profile.name}</h2>
        <p className="pm-superlike-overlay__sub">Bu kişide öne çıkmak için süper beğeni gönder.</p>
        <div className="pm-superlike-overlay__actions">
          <button type="button" className="pm-superlike-overlay__cancel" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="pm-superlike-overlay__send" onClick={onConfirm}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  )
}
