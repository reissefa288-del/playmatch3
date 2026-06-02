/** Memory Duel — subtle cinematic ambience (visual only). */
export function MemoryDuelAmbient() {
  return (
    <div className="pm-memory-ambient" aria-hidden>
      <span className="pm-memory-ambient__bloom" />
      <span className="pm-memory-ambient__fog" />
      <span className="pm-memory-ambient__vignette" />
      <span className="pm-memory-ambient__particles">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </span>
    </div>
  )
}
