import type { PickupBanner } from '../utils/brickBreakEngine'

type BrickPickupBannerProps = {
  banner: PickupBanner | null
  variant: 'cyan' | 'pink'
}

export function BrickPickupBanner({ banner, variant }: BrickPickupBannerProps) {
  return (
    <div className="pm-brick-pickup-banner-wrap" aria-live="polite">
      <>
        {banner ? (
          <div
            key={banner.label}
            className={`pm-brick-pickup-banner is-${variant}`}
            role="status"
           
           
           
           
          >
            <span className="pm-brick-pickup-banner__ring" aria-hidden />
            <span className="pm-brick-pickup-banner__shine" aria-hidden />
            <span className="pm-brick-pickup-banner__text">{banner.label}</span>
          </div>
        ) : null}
      </>
    </div>
  )
}
