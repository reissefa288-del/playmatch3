const makeZoneParticles = (count: number, seed: number, maxLeft: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `z${seed}-${i}`,
    left: `${6 + ((i * 11 + seed * 3) % maxLeft)}%`,
    top: `${5 + ((i * 13 + seed * 5) % 90)}%`,
    delay: -((i * 0.65 + seed * 0.3) % 7),
    size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  }))

const makeScreenParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `s-${i}`,
    left: `${3 + ((i * 7.3) % 94)}%`,
    top: `${4 + ((i * 11.7) % 92)}%`,
    delay: -((i * 0.48) % 8),
    size: i % 4 === 0 ? 3.5 : i % 3 === 0 ? 2.5 : i % 2 === 0 ? 2 : 1.5,
    tone: i % 2 === 0 ? 'cyan' : 'pink',
  }))

const P1_PARTICLES = makeZoneParticles(14, 1, 88)
const P2_PARTICLES = makeZoneParticles(14, 2, 88)
const SCREEN_PARTICLES = makeScreenParticles(32)

/** Tam ekran canlı arka plan — nokta ızgarası, parçacık, ışık */
export function BubbleSideLiveBg() {
  return (
    <div className="pm-bubble-side-live" aria-hidden>
      <span className="pm-bubble-side-live__screen-mesh" />
      <span className="pm-bubble-side-live__screen-glow is-cyan" />
      <span className="pm-bubble-side-live__screen-glow is-pink" />
      <span className="pm-bubble-side-live__screen-shimmer is-cyan" />
      <span className="pm-bubble-side-live__screen-shimmer is-pink" />
      {SCREEN_PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`pm-bubble-side-live__dot is-${p.tone}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="pm-bubble-side-live__zone is-p1">
        <span className="pm-bubble-side-live__pulse" />
        <span className="pm-bubble-side-live__pulse is-delay" />
        <span className="pm-bubble-side-live__shimmer" />
        <span className="pm-bubble-side-live__streak" />
        <span className="pm-bubble-side-live__streak is-alt" />
        <span className="pm-bubble-side-live__streak is-third" />
        {P1_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="pm-bubble-side-live__dot is-cyan"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="pm-bubble-side-live__zone is-p2">
        <span className="pm-bubble-side-live__pulse" />
        <span className="pm-bubble-side-live__pulse is-delay" />
        <span className="pm-bubble-side-live__shimmer" />
        <span className="pm-bubble-side-live__streak" />
        <span className="pm-bubble-side-live__streak is-alt" />
        <span className="pm-bubble-side-live__streak is-third" />
        {P2_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="pm-bubble-side-live__dot is-pink"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
