import { useEffect } from 'react'
import { FiUserPlus, FiX } from 'react-icons/fi'
import { useMatchConnections } from '../../match/useMatchConnections'
import { MatchedPlayerInviteRow } from './MatchedPlayerInviteRow'

type GameInviteSheetProps = {
  open: boolean
  onClose: () => void
}

export function GameInviteSheet({ open, onClose }: GameInviteSheetProps) {
  const { matches } = useMatchConnections()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            className="pm-games-invite-sheet__backdrop"
            aria-label="Kapat"
           
           
           
            onClick={onClose}
          />
          <section
            className="pm-games-invite-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-games-invite-sheet-title"
            style={{ x: '-50%', y: '-50%' }}
           
           
           
           
          >
            <header className="pm-games-invite-sheet__head">
              <div>
                <h2 id="pm-games-invite-sheet-title">
                  <FiUserPlus aria-hidden /> Eşleşmelerine Davet Et
                </h2>
                <p>Oyun daveti gönder, birlikte özel odada oynayın.</p>
              </div>
              <button
                type="button"
                className="pm-games-invite-sheet__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                <FiX />
              </button>
            </header>

            <ul className="pm-games-invite-sheet__list">
              {matches.map((profile) => (
                <MatchedPlayerInviteRow key={profile.id} profile={profile} />
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </>
  )
}
