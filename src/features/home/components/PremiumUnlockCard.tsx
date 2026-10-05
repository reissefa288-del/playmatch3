import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { Link } from 'react-router-dom'
import kasaIcon from '../../../reference/opt/thumb/kasa.webp'
import { LazyImage } from '../../../shared/LazyImage'
import { premiumUnlockBanner } from '../data'
import { isPremiumFeatureEnabled } from '../../premium/premiumAvailability'

export function PremiumUnlockCard() {
  const reduceMotion = usePrefersReducedMotion()
  if (!isPremiumFeatureEnabled()) return null
  return (
    <section
      className={`pm-premium-unlock pm-home-lower-block${reduceMotion ? '' : ' pm-enter-fade-up'}`}
      aria-label="Premium kilidi aç"
    >
      <span className="pm-premium-unlock__glow" aria-hidden />
      <span className="pm-premium-unlock__ring" aria-hidden />

      <div className="pm-premium-unlock__hero">
        <div className="pm-premium-unlock__kasa-stage">
          <span className="pm-premium-unlock__kasa-glow" aria-hidden />
          <LazyImage src={kasaIcon} alt="" className="pm-premium-unlock__kasa" width={72} height={72} />
        </div>
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
    </section>
  )
}
