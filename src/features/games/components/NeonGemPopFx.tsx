type NeonGemPopFxProps = {
  accent: 'cyan' | 'pink'
  mega?: boolean
}

export function NeonGemPopFx({ accent, mega = false }: NeonGemPopFxProps) {
  return (
    <span className={`pm-ncrush-gem__pop is-${accent}${mega ? ' is-mega' : ''}`} aria-hidden>
      <span className="pm-ncrush-gem__pop-ring" />
      <span className="pm-ncrush-gem__pop-burst" />
      {Array.from({ length: 6 }, (_, i) => (
        <i key={i} className="pm-ncrush-gem__pop-spark" style={{ ['--i' as string]: i }} />
      ))}
    </span>
  )
}
