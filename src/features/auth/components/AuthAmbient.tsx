const PARTICLE_COUNT = 18

export function AuthAmbient() {
  return (
    <div className="pm-auth-ambient" aria-hidden>
      <div className="pm-auth-ambient__vignette" />
      <div className="pm-auth-ambient__grid" />
      <span className="pm-auth-ambient__orb pm-auth-ambient__orb--cyan" />
      <span className="pm-auth-ambient__orb pm-auth-ambient__orb--pink" />
      <span className="pm-auth-ambient__orb pm-auth-ambient__orb--violet" />
      <div className="pm-auth-ambient__particles">
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span key={i} className="pm-auth-ambient__particle" />
        ))}
      </div>
      <span className="pm-auth-ambient__scanline" />
    </div>
  )
}
