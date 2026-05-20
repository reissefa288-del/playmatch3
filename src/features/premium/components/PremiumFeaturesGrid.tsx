import { IoDiamondOutline } from 'react-icons/io5'
import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { PremiumFeature } from '../data'
import { PremiumFeatureIcon } from './PremiumFeatureIcon'

type PremiumFeaturesGridProps = {
  features: PremiumFeature[]
}

export function PremiumFeaturesGrid({ features }: PremiumFeaturesGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="pm-premium-section pm-premium-section--features"
      aria-label="Premium ayrıcalıkları"
    >
      <header className="pm-premium-section__head pm-premium-section__head--aaa pm-premium-section__head--features">
        <span
          className="pm-premium-section__head-icon pm-premium-section__head-icon--diamond"
          aria-hidden
        >
          <span className="pm-premium-section__head-icon-ring" />
          <span className="pm-premium-section__head-icon-glow" />
          <IoDiamondOutline />
        </span>
        <h2>Premium Ayrıcalıkları</h2>
      </header>
      <motion.div
        className="pm-premium-features pm-premium-features--aaa"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
        }}
      >
        {features.map((feature, index) => (
          <motion.article
            key={feature.id}
            className={`pm-premium-feature pm-premium-feature--aaa is-${feature.accent}`}
            style={{ '--pm-feature-i': index } as CSSProperties}
            variants={{
              hidden: { opacity: 0, y: 16, scale: 0.92 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 380, damping: 26 },
              },
            }}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -5, scale: 1.03, transition: { duration: 0.22 } }
            }
          >
            <span className="pm-premium-feature__border-glow" aria-hidden />
            <span className="pm-premium-feature__glow" aria-hidden />

            <motion.div
              className="pm-premium-feature__icon-stage"
              animate={
                reduceMotion ? undefined : { y: [0, -3, 0] }
              }
              transition={{
                duration: 3.2 + index * 0.25,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.15,
              }}
            >
              <span className="pm-premium-feature__icon-ring" aria-hidden />
              <span className="pm-premium-feature__icon-orb" aria-hidden />
              <span className="pm-premium-feature__icon">
                <PremiumFeatureIcon featureId={feature.id} />
              </span>
              <span className="pm-premium-feature__icon-spark" aria-hidden />
            </motion.div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
