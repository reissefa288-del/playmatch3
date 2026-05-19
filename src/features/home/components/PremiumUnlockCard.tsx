import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import kasaIcon from '../../../reference/kasa.png'
import { premiumUnlockBanner } from '../data'

export function PremiumUnlockCard() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className="pm-premium-unlock pm-home-lower-block"
      aria-label="Premium kilidi aç"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <span className="pm-premium-unlock__glow" aria-hidden />
      <span className="pm-premium-unlock__ring" aria-hidden />

      <div className="pm-premium-unlock__hero">
        <motion.div
          className="pm-premium-unlock__kasa-stage"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -10, -5, -12, 0],
                  scale: [1, 1.04, 1.02, 1.05, 1],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="pm-premium-unlock__kasa-glow" aria-hidden />
          <img src={kasaIcon} alt="" className="pm-premium-unlock__kasa" />
        </motion.div>
      </div>

      <div className="pm-premium-unlock__copy">
        <h3>{premiumUnlockBanner.title}</h3>
        <p>{premiumUnlockBanner.subtitle}</p>
        <ul>
          {premiumUnlockBanner.perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      </div>

      <Link to="/premium" className="pm-premium-unlock__cta">
        <span>{premiumUnlockBanner.cta}</span>
      </Link>
    </motion.section>
  )
}
