const PARTICLE_COUNT = 12

export function OnboardingAmbient() {
  return (
    <div className="pm-onboard-ambient" aria-hidden>
      <div className="pm-onboard-ambient__base" />
      <div className="pm-onboard-ambient__mesh" />
      <span className="pm-onboard-ambient__orb pm-onboard-ambient__orb--cyan" />
      <span className="pm-onboard-ambient__orb pm-onboard-ambient__orb--pink" />
      <span className="pm-onboard-ambient__orb pm-onboard-ambient__orb--violet" />
      <div className="pm-onboard-ambient__particles">
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span key={i} className="pm-onboard-ambient__particle" />
        ))}
      </div>
      <div className="pm-onboard-ambient__vignette" />
    </div>
  )
}
