type Props = {
  gain: number
  combo: number
  variant: 'p1' | 'p2'
  pulseKey: number
  visible: boolean
}

export function SimonDuelScorePop({ gain, combo, variant, pulseKey, visible }: Props) {
  const hot = combo >= 4
  const mega = combo >= 6

  return (
    <div
      className={[
        'pm-simon-score-pop-wrap',
        `is-${variant}`,
        hot ? 'is-hot' : '',
        mega ? 'is-mega' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      {visible && gain > 0 ? (
        <div key={pulseKey} className="pm-simon-score-pop pm-score-pop-enter">
          <span className="pm-simon-score-pop__spark" aria-hidden />
          <span className="pm-simon-score-pop__gain">+{gain}</span>
          <span className="pm-simon-score-pop__label">PUAN</span>
          {combo >= 2 ? (
            <span className="pm-simon-score-pop__combo">
              COMBO <strong>×{combo}</strong>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
