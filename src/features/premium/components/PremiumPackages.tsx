import { useState } from 'react'
import { FiCheck, FiLock } from 'react-icons/fi'
import { LuCrown } from 'react-icons/lu'
import { motion, useReducedMotion } from 'framer-motion'
import type { PremiumPackage } from '../data'
import { premiumTrust } from '../data'

type PremiumPackagesProps = {
  packages: PremiumPackage[]
}

export function PremiumPackages({ packages }: PremiumPackagesProps) {
  const reduceMotion = useReducedMotion()
  const defaultId = packages.find((p) => p.popular)?.id ?? packages[0]?.id ?? '3m'
  const [selectedId, setSelectedId] = useState(defaultId)

  return (
    <section className="pm-premium-section" aria-label="Premium paketleri">
      <header className="pm-premium-section__head">
        <LuCrown aria-hidden />
        <h2>Premium Paketleri</h2>
      </header>

      <div className="pm-premium-packages">
        {packages.map((pkg, index) => {
          const isSelected = selectedId === pkg.id
          const isPopular = pkg.popular

          return (
            <motion.article
              key={pkg.id}
              className={[
                'pm-premium-package',
                isPopular ? 'is-popular' : '',
                isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.07, duration: 0.45 }}
              onClick={() => setSelectedId(pkg.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedId(pkg.id)
                }
              }}
              aria-pressed={isSelected}
            >
              {isPopular ? <span className="pm-premium-package__badge">EN POPÜLER</span> : null}
              {pkg.discount ? (
                <span className="pm-premium-package__discount">{pkg.discount}</span>
              ) : null}
              <span className="pm-premium-package__edge" aria-hidden />
              <h3>{pkg.duration}</h3>
              <p className="pm-premium-package__price">
                <strong>{pkg.price}</strong>
                {pkg.period ? <span>{pkg.period}</span> : null}
              </p>
              <ul className="pm-premium-package__perks">
                {pkg.perks.map((perk) => (
                  <li key={perk}>
                    <FiCheck aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
              <motion.button
                type="button"
                className="pm-premium-package__select"
                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(pkg.id)
                }}
              >
                Seç
              </motion.button>
            </motion.article>
          )
        })}
      </div>

      <p className="pm-premium-trust">
        <FiLock aria-hidden />
        {premiumTrust.text}
      </p>
    </section>
  )
}
