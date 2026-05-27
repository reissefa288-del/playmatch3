import { motion } from 'framer-motion'
import duelVideo from '../../../reference/video.mp4'
import { SeamlessLoopVideo } from './SeamlessLoopVideo'

const STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 3) % 78}%`,
  size: i % 7 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  delay: -(i * 0.45) % 6,
}))

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 5) % 94 + 3}%`,
  top: `${(i * 19 + 11) % 86 + 5}%`,
  delay: -(i * 0.65) % 5,
  tone: i % 3,
}))

const BEAMS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  left: `${12 + i * 19}%`,
  delay: -(i * 0.9) % 6,
}))

type GameDuelAmbientBgProps = {
  /** Bubble: gölgeleme kapalı, daha açık mavi/pembe ton */
  variant?: 'default' | 'bubble'
  /** Arka plan videosu (video.mp4) */
  video?: boolean
}

/** Paylaşılan premium AAA duel arka planı — Block · Brick · Bubble · XOX */
export function GameDuelAmbientBg({ variant = 'default', video = true }: GameDuelAmbientBgProps) {
  const isBubble = variant === 'bubble'

  return (
    <motion.div
      className={`pm-duel-ambient${isBubble ? ' is-bubble' : ''}`}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {video ? (
        <div className="pm-duel-ambient__video" aria-hidden>
          <SeamlessLoopVideo src={duelVideo} crossfadeSec={0.52} />
        </div>
      ) : null}
      <motion.div
        className="pm-duel-ambient__base"
        animate={{ backgroundPosition: ['0% 0%', '5% 2%', '2% 5%', '0% 0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__nebula"
        animate={{ rotate: [-2, 2, -2], scale: [1, 1.035, 1], opacity: [0.38, 0.54, 0.38] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pm-duel-ambient__split pm-duel-ambient__split--cyan"
        animate={{
          opacity: isBubble ? [0.52, 0.72, 0.52] : [0.22, 0.42, 0.22],
          x: ['-1%', '1.5%', '-1%'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__split pm-duel-ambient__split--pink"
        animate={{
          opacity: isBubble ? [0.5, 0.7, 0.5] : [0.2, 0.4, 0.2],
          x: ['1%', '-1.5%', '1%'],
        }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />

      <motion.div
        className="pm-duel-ambient__aurora pm-duel-ambient__aurora--cyan"
        animate={{ x: ['-2%', '2.5%', '-2%'], y: [0, -8, 0], opacity: [0.26, 0.48, 0.32, 0.26] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__aurora pm-duel-ambient__aurora--pink"
        animate={{ x: ['2%', '-2.5%', '2%'], y: [0, 7, 0], opacity: [0.24, 0.44, 0.3, 0.24] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      <motion.div
        className="pm-duel-ambient__aurora pm-duel-ambient__aurora--gold"
        animate={{ y: [0, -4, 0], opacity: [0.12, 0.26, 0.12] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />

      <motion.div
        className="pm-duel-ambient__orb pm-duel-ambient__orb--cyan"
        animate={{ opacity: [0.1, 0.22, 0.12], y: [0, -8, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__orb pm-duel-ambient__orb--pink"
        animate={{ opacity: [0.09, 0.2, 0.1], y: [0, 7, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 11.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="pm-duel-ambient__orb pm-duel-ambient__orb--center"
        animate={{ opacity: [0.05, 0.14, 0.06], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />

      <motion.div
        className="pm-duel-ambient__horizon"
        animate={{ opacity: [0.38, 0.62, 0.38] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pm-duel-ambient__grid"
        animate={{ backgroundPosition: ['50% 0%', '50% 100%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="pm-duel-ambient__scan"
        animate={{ y: ['-12%', '12%', '-12%'], opacity: [0.16, 0.32, 0.16] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div className="pm-duel-ambient__beams" aria-hidden>
        {BEAMS.map((beam) => (
          <span
            key={beam.id}
            className="pm-duel-ambient__beam"
            style={{ left: beam.left, animationDelay: `${beam.delay}s` }}
          />
        ))}
      </motion.div>

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
      {!isBubble ? <span className="pm-duel-ambient__dim" /> : null}
      {!isBubble ? <span className="pm-duel-ambient__vignette" /> : null}
    </motion.div>
  )
}
