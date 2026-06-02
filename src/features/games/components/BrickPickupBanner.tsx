import { AnimatePresence, motion } from 'framer-motion'
import type { PickupBanner } from '../utils/brickBreakEngine'

type BrickPickupBannerProps = {
  banner: PickupBanner | null
  variant: 'cyan' | 'pink'
}

export function BrickPickupBanner({ banner, variant }: BrickPickupBannerProps) {
  return (
    <div className="pm-brick-pickup-banner-wrap" aria-live="polite">
      <AnimatePresence mode="wait">
        {banner ? (
          <motion.div
            key={banner.label}
            className={`pm-brick-pickup-banner is-${variant}`}
            role="status"
            initial={{ opacity: 0, scale: 0.55, y: 14 }}
            animate={{
              opacity: 1,
              scale: [0.55, 1.12, 1],
              y: [14, -4, 0],
            }}
            exit={{ opacity: 0, scale: 0.88, y: -16, filter: 'blur(2px)' }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1.12, 0.36, 1],
              scale: { times: [0, 0.55, 1], duration: 0.42 },
              y: { times: [0, 0.5, 1], duration: 0.42 },
            }}
          >
            <span className="pm-brick-pickup-banner__ring" aria-hidden />
            <span className="pm-brick-pickup-banner__shine" aria-hidden />
            <span className="pm-brick-pickup-banner__text">{banner.label}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
