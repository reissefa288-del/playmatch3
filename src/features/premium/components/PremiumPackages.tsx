import type { CSSProperties } from 'react'
import { FiCheck, FiLock, FiStar } from 'react-icons/fi'
import type { PremiumPackage } from '../data'
import { premiumTrust } from '../data'

type PremiumPackagesProps = {
  packages: PremiumPackage[]
  selectedId: string
  onSelect: (id: string) => void
  onUpgrade: () => void
}

export function PremiumPackages({
  packages,
  selectedId,
  onSelect,
  onUpgrade,
}: PremiumPackagesProps) {

  return (
    <section className="pm-premium-section pm-premium-section--packages" aria-label="Premium paketleri">
      <header
        className="pm-premium-section__head pm-premium-section__head--aaa"
       
       
       
      >
        <h2>Premium Paketleri</h2>
      </header>

      <div
        className="pm-premium-packages pm-premium-packages--aaa"
       
       
       
      >
        {packages.map((pkg, index) => {
          const isSelected = selectedId === pkg.id
          const isPopular = pkg.popular

          return (
            <article
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
                <div
                  className="pm-premium-package__badge-wrap"
                 
                 
                 
                >
                  <span className="pm-premium-package__badge">
                    <FiStar aria-hidden />
                    EN POPÜLER
                  </span>
                </div>
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

              <button
                type="button"
                className="pm-premium-package__select"
               
               
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(pkg.id)
                }}
              >
                <span className="pm-premium-package__select-shine" aria-hidden />
                {isSelected ? 'Seçili ✓' : 'Seç'}
              </button>
            </article>
          )
        })}
      </div>

      <button
        type="button"
        className="pm-premium-packages__upgrade pm-premium-packages__upgrade--aaa"
       
       
       
       
       
        onClick={onUpgrade}
      >
        <span className="pm-premium-packages__upgrade-aura" aria-hidden />
        <span className="pm-premium-packages__upgrade-shine" aria-hidden />
        Hemen Yükselt
      </button>

      <p className="pm-premium-trust">
        <FiLock aria-hidden />
        {premiumTrust.text}
      </p>
    </section>
  )
}
