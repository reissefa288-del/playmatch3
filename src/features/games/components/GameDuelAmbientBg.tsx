import '../../../styles/game-duel-ambient.css'

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
}

/** Paylaşılan premium AAA duel arka planı (video ayrı — GameDuelVideoBg) */
export function GameDuelAmbientBg({ variant = 'default' }: GameDuelAmbientBgProps) {
  const isBubble = variant === 'bubble'

  return (
    <div className={`pm-duel-ambient${isBubble ? ' is-bubble' : ''}`} aria-hidden>
      <div className="pm-duel-ambient__base" />
      <div className="pm-duel-ambient__nebula" />

      <div className="pm-duel-ambient__split pm-duel-ambient__split--cyan" />
      <div className="pm-duel-ambient__split pm-duel-ambient__split--pink" />

      <div className="pm-duel-ambient__aurora pm-duel-ambient__aurora--cyan" />
      <div className="pm-duel-ambient__aurora pm-duel-ambient__aurora--pink" />
      <div className="pm-duel-ambient__aurora pm-duel-ambient__aurora--gold" />

      <div className="pm-duel-ambient__orb pm-duel-ambient__orb--cyan" />
      <div className="pm-duel-ambient__orb pm-duel-ambient__orb--pink" />
      <div className="pm-duel-ambient__orb pm-duel-ambient__orb--center" />

      <div className="pm-duel-ambient__horizon" />
      <div className="pm-duel-ambient__grid" />
      <div className="pm-duel-ambient__scan" />

      <div className="pm-duel-ambient__beams" aria-hidden>
        {BEAMS.map((beam) => (
          <span
            key={beam.id}
            className="pm-duel-ambient__beam"
            style={{ left: beam.left, animationDelay: `${beam.delay}s` }}
          />
        ))}
      </div>

      <div className="pm-duel-ambient__particles" aria-hidden>
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className={`pm-duel-ambient__particle is-tone-${particle.tone}`}
            style={{ left: particle.left, top: particle.top, animationDelay: `${particle.delay}s` }}
          />
        ))}
      </div>

      <div className="pm-duel-ambient__city" />

      <div className="pm-duel-ambient__stars" aria-hidden>
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
      </div>

      <span className="pm-duel-ambient__grain" />
      {!isBubble ? <span className="pm-duel-ambient__dim" /> : null}
      {!isBubble ? <span className="pm-duel-ambient__vignette" /> : null}
    </div>
  )
}
