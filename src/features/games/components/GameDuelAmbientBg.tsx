import { motion } from 'framer-motion'

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 3) % 78}%`,
  size: i % 7 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  delay: -(i * 0.45) % 6,
}))

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 5) % 94 + 3}%`,
  top: `${(i * 19 + 11) % 86 + 5}%`,
  delay: -(i * 0.65) % 5,
  tone: i % 3,
}))

/** Paylaşılan premium AAA duel arka planı — Block · Brick · Bubble · XOX */
export function GameDuelAmbientBg() {
  return (
    <motion.div
      className="pm-duel-ambient"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <motion.div
        className="pm-duel-ambient__base"
        animate={{ backgroundPosition: ['0% 0%', '4% 2%', '1% 3%', '0% 0%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pm-duel-ambient__split pm-duel-ambient__split--cyan"
        animate={{ opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__split pm-duel-ambient__split--pink"
        animate={{ opacity: [0.16, 0.3, 0.16] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />

      <motion.div
        className="pm-duel-ambient__aurora pm-duel-ambient__aurora--cyan"
        animate={{ x: ['-1%', '2%', '-1%'], y: [0, -5, 0], opacity: [0.22, 0.38, 0.26, 0.22] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__aurora pm-duel-ambient__aurora--pink"
        animate={{ x: ['1%', '-2%', '1%'], y: [0, 4, 0], opacity: [0.2, 0.34, 0.24, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      <motion.div
        className="pm-duel-ambient__orb pm-duel-ambient__orb--cyan"
        animate={{ opacity: [0.06, 0.14, 0.08], y: [0, -6, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__orb pm-duel-ambient__orb--pink"
        animate={{ opacity: [0.05, 0.12, 0.07], y: [0, 5, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.div className="pm-duel-ambient__particles" aria-hidden>
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className={`pm-duel-ambient__particle is-tone-${particle.tone}`}
            style={{ left: particle.left, top: particle.top, animationDelay: `${particle.delay}s` }}
          />
        ))}
      </motion.div>

      <motion.div
        className="pm-duel-ambient__city"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div className="pm-duel-ambient__stars" aria-hidden>
        {STARS.map((star) => (
          <span
            key={star.id}
            className="pm-duel-ambient__star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </motion.div>

      <span className="pm-duel-ambient__grain" />
      <span className="pm-duel-ambient__dim" />
      <span className="pm-duel-ambient__vignette" />
    </motion.div>
  )
}
