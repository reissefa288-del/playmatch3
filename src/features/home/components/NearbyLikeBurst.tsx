import { IoHeart } from 'react-icons/io5'
import { motion } from 'framer-motion'

const PARTICLE_COUNT = 8

type NearbyLikeBurstProps = {
  variant?: 'card' | 'list'
}

export function NearbyLikeBurst({ variant = 'card' }: NearbyLikeBurstProps) {
  return (
    <motion.div
      className={`pm-nearby-card__like-burst${variant === 'list' ? ' pm-nearby-card__like-burst--list' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="polite"
    >
      <span className="pm-nearby-card__like-burst-ring" aria-hidden />
      <span className="pm-nearby-card__like-burst-icon" aria-hidden>
        <IoHeart />
      </span>
      <strong>Beğenildi!</strong>

      <div className="pm-nearby-card__heart-particles" aria-hidden>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span
            key={i}
            className="pm-nearby-card__heart-particle"
            style={{ ['--i' as string]: String(i) }}
          >
            ♥
          </span>
        ))}
      </div>
    </motion.div>
  )
}
