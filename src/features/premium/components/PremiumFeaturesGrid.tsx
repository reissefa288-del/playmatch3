import { IoDiamondOutline } from 'react-icons/io5'
import { motion, useReducedMotion } from 'framer-motion'
import type { PremiumFeature } from '../data'

type PremiumFeaturesGridProps = {
  features: PremiumFeature[]
}

export function PremiumFeaturesGrid({ features }: PremiumFeaturesGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-premium-section" aria-label="Premium ayrıcalıkları">
      <header className="pm-premium-section__head">
        <IoDiamondOutline aria-hidden />
        <h2>Premium Ayrıcalıkları</h2>
      </header>
      <motion.div
        className="pm-premium-features"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {features.map((feature) => (
          <motion.article
            key={feature.id}
            className={`pm-premium-feature is-${feature.accent}`}
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.94 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
          >
            <span className="pm-premium-feature__glow" aria-hidden />
            <span className="pm-premium-feature__icon">
              <feature.icon aria-hidden />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
