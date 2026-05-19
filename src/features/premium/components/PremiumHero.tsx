import { FiCheck } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'
import { motion, useReducedMotion } from 'framer-motion'
import { premiumFloatingIcons, premiumHero } from '../data'

export function PremiumHero() {
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
        >
          <span className="pm-premium-hero__cta-shine" aria-hidden />
          <LuCrown aria-hidden />
          {premiumHero.cta}
        </motion.button>
      </motion.div>

      <motion.div
        className="pm-premium-hero__visual"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="pm-premium-hero__aura" aria-hidden />
        <span className="pm-premium-hero__pedestal" aria-hidden />
        <span className="pm-premium-hero__crown" aria-hidden />
        {premiumFloatingIcons.map((item, index) => (
          <motion.span
            key={item.id}
            className={`pm-premium-hero__float ${item.className}`}
            animate={reduceMotion ? undefined : { y: [0, -5, 0], opacity: [0.85, 1, 0.85] }}
            transition={{
              duration: 3.5 + index * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            }}
            aria-hidden
          >
            <item.icon />
          </motion.span>
        ))}
      </motion.div>
    </motion.section>
  )
}
