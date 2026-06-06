import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  gain: number
  combo: number
  variant: 'p1' | 'p2'
  pulseKey: number
  visible: boolean
}

export function SimonDuelScorePop({ gain, combo, variant, pulseKey, visible }: Props) {
  const hot = combo >= 4
  const mega = combo >= 6

  return (
    <div
      className={[
        'pm-simon-score-pop-wrap',
        `is-${variant}`,
        hot ? 'is-hot' : '',
        mega ? 'is-mega' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      <AnimatePresence>
        {visible && gain > 0 ? (
          <motion.div
            key={pulseKey}
            className="pm-simon-score-pop"
            initial={{ opacity: 0, scale: 0.55, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.12, y: -22 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
          >
            <span className="pm-simon-score-pop__spark" aria-hidden />
            <span className="pm-simon-score-pop__gain">+{gain}</span>
            <span className="pm-simon-score-pop__label">PUAN</span>
            {combo >= 2 ? (
              <span className="pm-simon-score-pop__combo">
                COMBO <strong>×{combo}</strong>
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
