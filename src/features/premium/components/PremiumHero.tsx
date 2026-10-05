import { FiCheck } from 'react-icons/fi'
import kasaIcon from '../../../reference/opt/thumb/kasa.webp'
import { LazyImage } from '../../../shared/LazyImage'
import { premiumHero } from '../data'

type PremiumHeroProps = {
  onUpgrade: () => void
}

export function PremiumHero({ onUpgrade }: PremiumHeroProps) {

  return (
    <section
      className="pm-premium-hero"
      aria-label="Premium tanıtım"
     
     
     
    >
      <span className="pm-premium-hero__edge" aria-hidden />
      <span className="pm-premium-hero__shine" aria-hidden />

      <div className="pm-premium-hero__content">
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
        <button
          type="button"
          className="pm-premium-hero__cta"
         
         
          onClick={onUpgrade}
        >
          <span className="pm-premium-hero__cta-shine" aria-hidden />
          {premiumHero.cta}
        </button>
      </div>

      <div
        className="pm-premium-hero__visual"
       
       
      >
        <span className="pm-premium-hero__aura" aria-hidden />
        <div
          className="pm-premium-hero__kasa-stage"
         
         
        >
          <span className="pm-premium-hero__kasa-glow" aria-hidden />
          <LazyImage src={kasaIcon} alt="" className="pm-premium-hero__kasa" width={96} height={96} priority />
        </div>
      </div>
    </section>
  )
}
