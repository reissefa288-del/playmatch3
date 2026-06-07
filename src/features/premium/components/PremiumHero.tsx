import { FiCheck } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import kasaIcon from '../../../reference/kasa.png'
import { premiumHero } from '../data'

type PremiumHeroProps = {
  onUpgrade: () => void
}

export function PremiumHero({ onUpgrade }: PremiumHeroProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className="pm-premium-hero"
      aria-label="Premium tanıtım"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="pm-premium-hero__edge" aria-hidden />
      <span className="pm-premium-hero__shine" aria-hidden />

      <motion.div className="pm-premium-hero__content">
        <h2>{premiumHero.title}</h2>
        <p className="pm-premium-hero__tagline">{premiumHero.tagline}</p>
        <ul className="pm-premium-hero__perks">
          {premiumHero.perks.map((perk) => (
            <li key={perk}>
              <FiCheck aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
        <motion.button
          type="button"
          className="pm-premium-hero__cta"
          whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          onClick={onUpgrade}
        >
          <span className="pm-premium-hero__cta-shine" aria-hidden />
          {premiumHero.cta}
        </motion.button>
      </motion.div>

      <motion.div
        className="pm-premium-hero__visual"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="pm-premium-hero__aura" aria-hidden />
        <motion.div
          className="pm-premium-hero__kasa-stage"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -8, -4, -10, 0],
                  scale: [1, 1.03, 1.02, 1.04, 1],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="pm-premium-hero__kasa-glow" aria-hidden />
          <img src={kasaIcon} alt="" className="pm-premium-hero__kasa" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
