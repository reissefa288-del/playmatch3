import { IoDiamondOutline } from 'react-icons/io5'
import type { CSSProperties } from 'react'
import type { PremiumFeature } from '../data'
import { PremiumFeatureIcon } from './PremiumFeatureIcon'

type PremiumFeaturesGridProps = {
  features: PremiumFeature[]
}

export function PremiumFeaturesGrid({ features }: PremiumFeaturesGridProps) {

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
      <div
        className="pm-premium-features pm-premium-features--aaa"
       
       
       
      >
        {features.map((feature, index) => (
          <article
            key={feature.id}
            className={`pm-premium-feature pm-premium-feature--aaa is-${feature.accent}`}
            style={{ '--pm-feature-i': index } as CSSProperties}
           
           
          >
            <span className="pm-premium-feature__border-glow" aria-hidden />
            <span className="pm-premium-feature__glow" aria-hidden />

            <div
              className="pm-premium-feature__icon-stage"
             
             
            >
              <span className="pm-premium-feature__icon-ring" aria-hidden />
              <span className="pm-premium-feature__icon-orb" aria-hidden />
              <span className="pm-premium-feature__icon">
                <PremiumFeatureIcon featureId={feature.id} />
              </span>
              <span className="pm-premium-feature__icon-spark" aria-hidden />
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
