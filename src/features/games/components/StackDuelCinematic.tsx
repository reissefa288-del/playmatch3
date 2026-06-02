/** Stack Duel — screen-level AAA ambient layers (visual only). */
export function StackDuelCinematic() {
  return (
    <div className="pm-stack-cinematic" aria-hidden>
      <span className="pm-stack-cinematic__ray pm-stack-cinematic__ray--l" />
      <span className="pm-stack-cinematic__ray pm-stack-cinematic__ray--r" />
      <span className="pm-stack-cinematic__volumetric" />
      <span className="pm-stack-cinematic__bloom" />
      <span className="pm-stack-cinematic__scatter" />
      <span className="pm-stack-cinematic__ssr" />
      <span className="pm-stack-cinematic__grain" />
      <span className="pm-stack-cinematic__particles">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </span>
    </div>
  )
}
