import { colToPct, HOME_COLS, rowToPct, type FroggerSideState } from '../utils/froggerDuelEngine'
import type { Dir } from '../utils/froggerDuelEngine'

type Props = {
  p1: FroggerSideState
  p2: FroggerSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
}

function FroggerScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
}: {
  side: FroggerSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-frogger-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-frogger-screen__label">{label}</p>
      <div className="pm-frogger-screen__track" role="presentation">
        <div className="pm-frogger-screen__zone is-goal" aria-hidden />
        <div className="pm-frogger-screen__zone is-road" aria-hidden />
        <div className="pm-frogger-screen__zone is-safe-mid" aria-hidden />
        <div className="pm-frogger-screen__zone is-river" aria-hidden />
        <div className="pm-frogger-screen__zone is-start" aria-hidden />

        {HOME_COLS.map((col, i) => (
          <span
            key={col}
            className={['pm-frogger-screen__home', side.homesFilled[i] ? 'is-filled' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(col)}%`, top: `${rowToPct(0)}%` }}
            aria-hidden
          />
        ))}

        {side.vehicles.map((v) => (
          <span
            key={v.id}
            className={['pm-frogger-screen__vehicle', `is-${v.kind}`].join(' ')}
            style={{
              left: `${colToPct(v.x)}%`,
              top: `${rowToPct(v.row)}%`,
              width: `${(v.width / 9) * 100}%`,
            }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-frogger-screen__frog', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.frogCol)}%`, top: `${rowToPct(side.frogRow)}%` }}
            aria-hidden
          >
            🐸
          </span>
        ) : null}

        <div className="pm-frogger-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-frogger-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-frogger-screen__dpad" role="group" aria-label="Yön tuşları">
          <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
            ▲
          </button>
          <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
            ◀
          </button>
          <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')} aria-label="Aşağı">
            ▼
          </button>
          <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
            ▶
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function FroggerDuelArena({ p1, p2, now, disabled = false, onMove }: Props) {
  return (
    <div className="pm-frogger-arena">
      <FroggerScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onMove={onMove} />
      <FroggerScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
