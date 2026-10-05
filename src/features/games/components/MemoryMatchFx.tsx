type MemoryMatchFxProps = {
  accent: 'cyan' | 'pink'
}

export function MemoryMatchFx({ accent }: MemoryMatchFxProps) {
  return (
    <span
      className={`pm-memory-match-fx is-${accent}`}
     
     
     
     
      aria-hidden
    >
      <span className="pm-memory-match-fx__ring" />
      <span className="pm-memory-match-fx__burst" />
      {Array.from({ length: 6 }, (_, i) => (
        <i key={i} className="pm-memory-match-fx__spark" style={{ ['--spark-i' as string]: i }} />
      ))}
    </span>
  )
}
