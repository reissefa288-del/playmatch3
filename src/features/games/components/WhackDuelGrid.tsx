type Props = {
  activeCell: number | null
  lastHitCell: number | null
  disabled?: boolean
  onWhack: (cell: number) => void
}

export function WhackDuelGrid({ activeCell, lastHitCell, disabled = false, onWhack }: Props) {
  return (
    <div className={['pm-whack-grid', disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')} role="group" aria-label="Whack ızgarası">
      {Array.from({ length: 9 }, (_, i) => {
        const isMole = activeCell === i
        const isHit = lastHitCell === i
        return (
          <button
            key={i}
            type="button"
            className={['pm-whack-grid__hole', isMole ? 'has-mole' : '', isHit ? 'is-hit' : ''].filter(Boolean).join(' ')}
            disabled={disabled}
            onClick={() => onWhack(i)}
            aria-label={isMole ? 'Kafa var — vur' : 'Boş delik'}
          >
            <span className="pm-whack-grid__rim" aria-hidden />
            {isMole ? <span className="pm-whack-grid__mole" aria-hidden /> : null}
          </button>
        )
      })}
    </div>
  )
}
