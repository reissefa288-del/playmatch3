import { NEARBY_DEMO_HINT, NEARBY_DEMO_LABEL } from '../nearbyDemo'

type NearbyDemoBannerProps = {
  onEnableLocation?: () => void
}

export function NearbyDemoBanner({ onEnableLocation }: NearbyDemoBannerProps) {
  return (
    <div className="pm-nearby-demo-banner" role="status">
      <strong>{NEARBY_DEMO_LABEL}</strong>
      <p>{NEARBY_DEMO_HINT}</p>
      {onEnableLocation ? (
        <button type="button" className="pm-nearby-demo-banner__cta" onClick={onEnableLocation}>
          Konum paylaşımını aç
        </button>
      ) : null}
    </div>
  )
}
