import { FiMapPin, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { NearbyPlayer } from '../types'
import { NearbyPlayerListCard } from './NearbyPlayerListCard'

type NearbyPlayersSheetProps = {
  open: boolean
  players: NearbyPlayer[]
  liveCaption?: string
  onClose: () => void
}

export function NearbyPlayersSheet({
  open,
  players,
  liveCaption,
  onClose,
}: NearbyPlayersSheetProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-nearby-sheet__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-nearby-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-nearby-sheet-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <header className="pm-nearby-sheet__head">
              <div>
                <h2 id="pm-nearby-sheet-title">
                  <FiMapPin aria-hidden /> Yakındaki Oyuncular
                </h2>
                {liveCaption ? <p>{liveCaption}</p> : null}
              </div>
              <button type="button" className="pm-nearby-sheet__close" onClick={onClose} aria-label="Kapat">
                <FiX />
              </button>
            </header>

            <ul className="pm-nearby-sheet__list">
              {players.map((player) => (
                <li key={player.id}>
                  <NearbyPlayerListCard player={player} />
                </li>
              ))}
            </ul>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
