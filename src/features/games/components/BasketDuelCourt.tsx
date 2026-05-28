import type { BasketPhase, ShotGrade } from '../utils/basketDuelEngine'

const GRADE_LABEL: Record<ShotGrade, string> = {
  perfect: 'MÜKEMMEL +3',
  good: 'İYİ +2',
  ok: 'GİRİŞ +1',
  miss: 'KAÇTI',
}

type Props = {
  phase: BasketPhase
  turn: 1 | 2
  marker: number
  lockedMarker: number | null
  lastGrade: ShotGrade | null
  lastPoints: number
  disabled?: boolean
  onShoot: () => void
}

export function BasketDuelCourt({
  phase,
  turn,
  marker,
  lockedMarker,
  lastGrade,
  lastPoints,
  disabled = false,
  onShoot,
}: Props) {
  const showMarker = phase === 'aim' ? marker : lockedMarker ?? marker
  const isFlight = phase === 'flight' || phase === 'turn-end'
  const swish = lastGrade === 'perfect' || lastGrade === 'good'

  return (
    <div className={['pm-basket-court', isFlight ? 'is-flight' : '', swish ? 'is-swish' : ''].filter(Boolean).join(' ')}>
      <div className="pm-basket-court__sky" aria-hidden />
      <div className="pm-basket-court__hoop" aria-hidden>
        <span className="pm-basket-court__rim" />
        <span className="pm-basket-court__backboard" />
      </div>

      <span
        className={['pm-basket-court__ball', isFlight ? 'is-flying' : '', lastGrade === 'miss' && isFlight ? 'is-miss' : ''].filter(Boolean).join(' ')}
        aria-hidden
      />

      <div className="pm-basket-court__meter">
        <div className="pm-basket-court__meter-zone is-perfect" aria-hidden />
        <div className="pm-basket-court__meter-zone is-good" aria-hidden />
        <span
          className="pm-basket-court__needle"
          style={{ left: `${showMarker}%` }}
          aria-hidden
        />
      </div>

      {lastGrade && (phase === 'flight' || phase === 'turn-end') ? (
        <p className={`pm-basket-court__grade is-${lastGrade}`}>
          {GRADE_LABEL[lastGrade]}
          {lastPoints > 0 ? ` · +${lastPoints}` : ''}
        </p>
      ) : (
        <p className="pm-basket-court__hint">
          {turn === 1 ? 'Yeşil bölgede ŞUT!' : 'Rakip atıyor…'}
        </p>
      )}

      <button
        type="button"
        className="pm-basket-court__shoot"
        disabled={disabled || phase !== 'aim' || turn !== 1}
        onClick={onShoot}
      >
        ŞUT
      </button>
    </div>
  )
}
