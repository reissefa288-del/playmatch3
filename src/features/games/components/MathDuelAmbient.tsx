/** Math Duel — subtle arena ambience (visual only). */
export function MathDuelAmbient() {
  return (
    <div className="pm-math-ambient" aria-hidden>
      <span className="pm-math-ambient__bloom" />
      <span className="pm-math-ambient__fog" />
      <span className="pm-math-ambient__particles">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </span>
    </div>
  )
}
