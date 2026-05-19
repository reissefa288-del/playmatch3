const PARTICLE_COUNT = 14

export function AmbientParticles() {
  return (
    <div className="pm-ambient-wrap" aria-hidden>
      <div className="pm-ambient-parallax">
        <span className="pm-ambient-orb pm-ambient-orb--blue" />
        <span className="pm-ambient-orb pm-ambient-orb--pink" />
        <span className="pm-ambient-orb pm-ambient-orb--violet" />
      </div>
      <div className="pm-ambient-particles">
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span key={i} className="pm-ambient-particle" />
        ))}
      </div>
      <div className="pm-ambient-streaks" aria-hidden>
        <span className="pm-ambient-streak pm-ambient-streak--a" />
        <span className="pm-ambient-streak pm-ambient-streak--b" />
      </div>
    </div>
  )
}
