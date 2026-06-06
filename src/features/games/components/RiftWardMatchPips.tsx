import { WIN_ROUNDS } from '../utils/missileCommandDuelEngine'

type Props = {
  p1Wins: number
  p2Wins: number
}

export function RiftWardMatchPips({ p1Wins, p2Wins }: Props) {
  return (
    <div className="pm-rw-match-pips" aria-label={`Maç skoru ${p1Wins} - ${p2Wins}`}>
      <div className="pm-rw-match-pips__side is-p1">
        {Array.from({ length: WIN_ROUNDS }, (_, i) => (
          <span key={i} className={['pm-rw-match-pips__pip', i < p1Wins ? 'is-won' : ''].filter(Boolean).join(' ')} aria-hidden />
        ))}
      </div>
      <span className="pm-rw-match-pips__vs">LEG</span>
      <div className="pm-rw-match-pips__side is-p2">
        {Array.from({ length: WIN_ROUNDS }, (_, i) => (
          <span key={i} className={['pm-rw-match-pips__pip', i < p2Wins ? 'is-won' : ''].filter(Boolean).join(' ')} aria-hidden />
        ))}
      </div>
    </div>
  )
}
