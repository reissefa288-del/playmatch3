import { useEffect } from 'react'
import { FiUserPlus, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { matchedProfiles } from '../../match/data'
import { MatchedPlayerInviteRow } from './MatchedPlayerInviteRow'

type GameInviteSheetProps = {
  open: boolean
  onClose: () => void
}

export function GameInviteSheet({ open, onClose }: GameInviteSheetProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-games-invite-sheet__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-games-invite-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-games-invite-sheet-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
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
              {matchedProfiles.map((profile) => (
                <MatchedPlayerInviteRow key={profile.id} profile={profile} />
              ))}
            </ul>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
