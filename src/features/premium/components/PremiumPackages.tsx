import type { CSSProperties } from 'react'
import { FiCheck, FiLock, FiStar } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'
import { motion, useReducedMotion } from 'framer-motion'
import type { PremiumPackage } from '../data'
import { premiumTrust } from '../data'

type PremiumPackagesProps = {
  packages: PremiumPackage[]
  selectedId: string
  onSelect: (id: string) => void
  onUpgrade: () => void
}

const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 360, damping: 28 },
  },
}

export function PremiumPackages({
  packages,
  selectedId,
  onSelect,
  onUpgrade,
}: PremiumPackagesProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-premium-section pm-premium-section--packages" aria-label="Premium paketleri">
      <motion.header
        className="pm-premium-section__head pm-premium-section__head--aaa"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="pm-premium-section__head-icon" aria-hidden>
          <span className="pm-premium-section__head-icon-ring" />
          <span className="pm-premium-section__head-icon-glow" />
          <LuCrown />
        </span>
        <h2>Premium Paketleri</h2>
      </motion.header>

      <motion.div
        className="pm-premium-packages pm-premium-packages--aaa"
        variants={reduceMotion ? undefined : listStagger}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? false : 'visible'}
      >
        {packages.map((pkg, index) => {
          const isSelected = selectedId === pkg.id
          const isPopular = pkg.popular

          return (
            <motion.article
              key={pkg.id}
              className={[
                'pm-premium-package',
                'pm-premium-package--aaa',
                isPopular ? 'is-popular' : '',
                isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--pm-package-i': index } as CSSProperties}
              variants={reduceMotion ? undefined : cardVariant}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: isPopular ? -8 : -5,
                      scale: isSelected ? 1.04 : 1.02,
                      transition: { duration: 0.22 },
                    }
              }
              onClick={() => onSelect(pkg.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(pkg.id)
                }
              }}
              aria-pressed={isSelected}
            >
              <span className="pm-premium-package__border-glow" aria-hidden />
              <span className="pm-premium-package__shine" aria-hidden />
              <span className="pm-premium-package__glow" aria-hidden />
              {isPopular ? <span className="pm-premium-package__aura" aria-hidden /> : null}

              {isPopular ? (
                <motion.div
                  className="pm-premium-package__badge-wrap"
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                >
                  <span className="pm-premium-package__badge">
                    <FiStar aria-hidden />
                    EN POPÜLER
                  </span>
                </motion.div>
              ) : null}
              {pkg.discount ? (
                <span className="pm-premium-package__discount">{pkg.discount}</span>
              ) : null}

              <h3>{pkg.duration}</h3>
              <p className="pm-premium-package__price">
                <strong>{pkg.price}</strong>
                {pkg.period ? <span>{pkg.period}</span> : null}
              </p>

              <ul className="pm-premium-package__perks">
                {pkg.perks.map((perk) => (
                  <li key={perk}>
                    <span className="pm-premium-package__check" aria-hidden>
                      <FiCheck />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <motion.button
                type="button"
                className="pm-premium-package__select"
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(pkg.id)
                }}
              >
                <span className="pm-premium-package__select-shine" aria-hidden />
                {isSelected ? 'Seçili ✓' : 'Seç'}
              </motion.button>
            </motion.article>
          )
        })}
      </motion.div>

      <motion.button
        type="button"
        className="pm-premium-packages__upgrade pm-premium-packages__upgrade--aaa"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        onClick={onUpgrade}
      >
        <span className="pm-premium-packages__upgrade-aura" aria-hidden />
        <span className="pm-premium-packages__upgrade-shine" aria-hidden />
        <LuCrown aria-hidden />
        Hemen Yükselt
      </motion.button>

      <p className="pm-premium-trust">
        <FiLock aria-hidden />
        {premiumTrust.text}
      </p>
    </section>
  )
}
