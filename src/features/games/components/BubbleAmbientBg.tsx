import { motion } from 'framer-motion'

const STARS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 3) % 72}%`,
  size: i % 5 === 0 ? 2 : 1,
  opacity: 0.15 + (i % 4) * 0.12,
}))

export function BubbleAmbientBg() {
  return (
    <motion.div className="pm-bubble-ambient" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="pm-bubble-ambient__base"
        animate={{ backgroundPosition: ['0% 0%', '4% 2%', '0% 0%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pm-bubble-ambient__aurora pm-bubble-ambient__aurora--cyan" />
      <motion.div
        className="pm-bubble-ambient__orb pm-bubble-ambient__orb--cyan"
        animate={{ opacity: [0.08, 0.18, 0.08], y: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-bubble-ambient__orb pm-bubble-ambient__orb--pink"
        animate={{ opacity: [0.07, 0.16, 0.07], y: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-bubble-ambient__aurora pm-bubble-ambient__aurora--pink"
        animate={{ opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-bubble-ambient__city"
        animate={{ opacity: [0.55, 0.72, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="pm-bubble-ambient__stars" aria-hidden>
        {STARS.map((star) => (
          <span
            key={star.id}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </motion.div>
      <span className="pm-bubble-ambient__grain" />
      <span className="pm-bubble-ambient__vignette" />
    </motion.div>
  )
}
