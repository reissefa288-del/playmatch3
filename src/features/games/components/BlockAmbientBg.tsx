import { motion } from 'framer-motion'

const STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 19 + 5) % 100}%`,
  top: `${(i * 27 + 2) % 80}%`,
  size: i % 4 === 0 ? 2 : 1,
  opacity: 0.12 + (i % 5) * 0.1,
}))

export function BlockAmbientBg() {
  return (
    <motion.div className="pm-block-ambient" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="pm-block-ambient__base" />
      <div className="pm-block-ambient__beam pm-block-ambient__beam--cyan" />
      <motion.div
        className="pm-block-ambient__beam pm-block-ambient__beam--pink"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pm-block-ambient__grid" />
      <motion.div className="pm-block-ambient__stars" aria-hidden>
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
      <span className="pm-block-ambient__vignette" />
    </motion.div>
  )
}
