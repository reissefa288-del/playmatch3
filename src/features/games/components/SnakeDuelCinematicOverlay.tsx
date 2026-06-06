import { AnimatePresence, motion } from 'framer-motion'
import { ROUND_BREAK_MS } from '../utils/snakeDuelEngine'

type Props = {
  open: boolean
  isMatchEnd: boolean
  message: string
  roundNumber: number
  matchRounds: number
  scoreP1: number
  scoreP2: number
  setP1: number
  setP2: number
  onRestart?: () => void
}

export function SnakeDuelCinematicOverlay({
  open,
  isMatchEnd,
  message,
  roundNumber,
  matchRounds,
  scoreP1,
  scoreP2,
  setP1,
  setP2,
  onRestart,
}: Props) {
  const winnerTone =
    message.includes('KAZANDIN') || message === 'EMİR KAZANDI'
      ? 'win'
      : message.includes('KAYBET') || message === 'ZEYNEP KAZANDI'
        ? 'lose'
        : 'draw'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`pm-snake-cinematic ${isMatchEnd ? 'is-match-end' : 'is-round-break'} is-${winnerTone}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="status"
        >
          <div className="pm-snake-cinematic__vignette" aria-hidden />
          <div className="pm-snake-cinematic__scan" aria-hidden />
          <div className="pm-snake-cinematic__grid" aria-hidden />

          <motion.div
            className="pm-snake-cinematic__panel"
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            {!isMatchEnd ? (
              <p className="pm-snake-cinematic__eyebrow">ROUND {Math.min(roundNumber, matchRounds)} BİTTİ</p>
            ) : (
              <p className="pm-snake-cinematic__eyebrow">MAÇ SONUCU</p>
            )}

            <motion.h2
              className="pm-snake-cinematic__title"
              initial={{ letterSpacing: '0.28em', opacity: 0 }}
              animate={{ letterSpacing: '0.1em', opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.45 }}
            >
              {message}
            </motion.h2>

            <div className="pm-snake-cinematic__scores">
              <motion.div
                className="pm-snake-cinematic__score is-p1"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 420, damping: 24 }}
              >
                <span>EMİR</span>
                <strong>{scoreP1}</strong>
                <small>SET {setP1}</small>
              </motion.div>

              <span className="pm-snake-cinematic__vs">VS</span>

              <motion.div
                className="pm-snake-cinematic__score is-p2"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 420, damping: 24 }}
              >
                <span>ZEYNEP</span>
                <strong>{scoreP2}</strong>
                <small>SET {setP2}</small>
              </motion.div>
            </div>

            {!isMatchEnd ? (
              <div className="pm-snake-cinematic__progress" aria-hidden>
                <motion.span
                  className="pm-snake-cinematic__progress-bar"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: ROUND_BREAK_MS / 1000, ease: 'linear' }}
                />
              </div>
            ) : (
              <button type="button" className="pm-snake-cinematic__btn" onClick={onRestart}>
                Tekrar Oyna
              </button>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
