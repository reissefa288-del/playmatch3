import {
  attackArrow,
  hpPct,
  type DodgeKind,
  type PunchKind,
  type PunchOutSideState,
} from '../utils/punchOutDuelEngine'

type Props = {
  p1: PunchOutSideState
  p2: PunchOutSideState
  disabled?: boolean
  onDodge: (dodge: DodgeKind) => void
  onPunch: (punch: PunchKind) => void
}

function PunchOutScreen({
  side,
  label,
  accent,
  interactive,
  disabled,
  onDodge,
  onPunch,
}: {
  side: PunchOutSideState
  label: string
  accent: 'cyan' | 'pink'
  interactive: boolean
  disabled?: boolean
  onDodge?: (dodge: DodgeKind) => void
  onPunch?: (punch: PunchKind) => void
}) {
  const canDodge = side.phase === 'attack' || side.phase === 'telegraph'
  const canPunch = side.phase === 'opening'

  return (
    <div className={['pm-po-screen', `is-${accent}`, `is-${side.phase}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-po-screen__label">{label}</p>
      <div className="pm-po-screen__ring" role="presentation">
        <div className="pm-po-screen__ropes" aria-hidden />
        <div className="pm-po-screen__crowd" aria-hidden />

        <div className="pm-po-screen__opponent" aria-hidden>
          <span className={['pm-po-screen__opp-body', side.phase === 'attack' ? 'is-attacking' : ''].filter(Boolean).join(' ')} />
          {side.attackKind && (side.phase === 'telegraph' || side.phase === 'attack') ? (
            <span className={`pm-po-screen__telegraph is-${side.attackKind}`}>{attackArrow(side.attackKind)}</span>
          ) : null}
        </div>

        <span
          className={['pm-po-screen__boxer', side.lastPunchKind ? `is-${side.lastPunchKind}` : ''].filter(Boolean).join(' ')}
          aria-hidden
        />

        {side.flashMessage ? <p className="pm-po-screen__flash">{side.flashMessage}</p> : null}

        <div className="pm-po-screen__bars">
          <div className="pm-po-screen__bar is-you">
            <span>SEN</span>
            <i><b style={{ width: `${hpPct(side.playerHp)}%` }} /></i>
          </div>
          <div className="pm-po-screen__bar is-opp">
            <span>RAKİP</span>
            <i><b style={{ width: `${hpPct(side.opponentHp)}%` }} /></i>
          </div>
        </div>
      </div>
      {interactive ? (
        <div className="pm-po-screen__controls">
          <div className="pm-po-screen__dodges" role="group" aria-label="Kaçın">
            <button type="button" disabled={disabled || !canDodge} onClick={() => onDodge?.('left')} aria-label="Sola kaç">
              ←
            </button>
            <button type="button" disabled={disabled || !canDodge} onClick={() => onDodge?.('duck')} aria-label="Eğil">
              ↓
            </button>
            <button type="button" disabled={disabled || !canDodge} onClick={() => onDodge?.('right')} aria-label="Sağa kaç">
              →
            </button>
          </div>
          <div className="pm-po-screen__punches" role="group" aria-label="Yumruk">
            <button type="button" disabled={disabled || !canPunch} onClick={() => onPunch?.('jab')}>
              JAB
            </button>
            <button type="button" disabled={disabled || !canPunch} onClick={() => onPunch?.('hook')}>
              HOOK
            </button>
            <button type="button" disabled={disabled || !canPunch} onClick={() => onPunch?.('uppercut')}>
              ALT
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PunchOutDuelArena({ p1, p2, disabled = false, onDodge, onPunch }: Props) {
  return (
    <div className="pm-po-arena">
      <PunchOutScreen
        side={p1}
        label="SEN"
        accent="cyan"
        interactive
        disabled={disabled}
        onDodge={onDodge}
        onPunch={onPunch}
      />
      <PunchOutScreen side={p2} label="RAKİP" accent="pink" interactive={false} />
    </div>
  )
}
