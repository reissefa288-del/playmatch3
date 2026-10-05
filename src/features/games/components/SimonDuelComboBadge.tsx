type Props = {
  combo: number
  variant: 'p1' | 'p2'
}

export function SimonDuelComboBadge({ combo, variant }: Props) {
  if (combo < 2) return null

  const hot = combo >= 4
  const mega = combo >= 6

  return (
    <div
      key={combo}
      className={[
        'pm-simon-combo',
        `is-${variant}`,
        hot ? 'is-hot' : '',
        mega ? 'is-mega' : '',
      ]
        .filter(Boolean)
        .join(' ')}
     
     
     
      aria-label={`Combo ${combo}`}
    >
      <span className="pm-simon-combo__label">COMBO</span>
      <strong className="pm-simon-combo__mult">×{combo}</strong>
    </div>
  )
}
