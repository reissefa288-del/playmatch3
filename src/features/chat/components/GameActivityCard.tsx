import { motion } from 'framer-motion'
import type { ChatDetail } from '../data'

type GameActivityCardProps = {
  lastGame: ChatDetail['lastGame']
}

export function GameActivityCard({ lastGame }: GameActivityCardProps) {
  return (
    <motion.section
      className="pm-message-activity"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.4 }}
      aria-label="Son oyun aktivitesi"
    >
      <span className="pm-message-activity__icon" aria-hidden>
        {lastGame.emoji}
      </span>
      <div className="pm-message-activity__copy">
        <p className="pm-message-activity__label">Birlikte Oyun Oynadınız</p>
        <p className="pm-message-activity__game-line">
          <strong className="pm-message-activity__game">{lastGame.title}</strong>
          <span className="pm-message-activity__ago">{lastGame.playedAgo}</span>
        </p>
      </div>
      <motion.button
        type="button"
        className="pm-message-activity__cta"
        whileHover={{ scale: 1.03, filter: 'brightness(1.08)' }}
        whileTap={{ scale: 0.96 }}
      >
        Tekrar Oyna
      </motion.button>
    </motion.section>
  )
}
