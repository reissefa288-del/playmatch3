/** Neon Crush — cinematic ambience (visual only). */
export function NeonCrushAmbient() {
  return (
    <div className="pm-ncrush-ambient" aria-hidden>
      <span className="pm-ncrush-ambient__bloom" />
      <span className="pm-ncrush-ambient__fog" />
      <span className="pm-ncrush-ambient__grid-glow" />
      <span className="pm-ncrush-ambient__vignette" />
      <span className="pm-ncrush-ambient__scanlines" />
      <span className="pm-ncrush-ambient__particles">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </span>
    </div>
  )
}
