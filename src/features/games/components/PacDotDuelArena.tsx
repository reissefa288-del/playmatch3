import { colToPct, isWall, rowToPct, COLS, ROWS, type PacSideState } from '../utils/pacDotDuelEngine'
import type { Dir } from '../utils/pacDotDuelEngine'

type Props = {
  p1: PacSideState
  p2: PacSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
}

function PacScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
}: {
  side: PacSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
}) {
  const invuln = now < side.invulnUntil
  const powered = now < side.powerUntil

  return (
    <div className={['pm-pacdot-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-pacdot-screen__label">{label}</p>
      <div className="pm-pacdot-screen__track" role="presentation">
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            if (!isWall(c, r)) return null
            return (
              <span
                key={`w-${c}-${r}`}
                className="pm-pacdot-screen__wall"
                style={{ left: `${colToPct(c)}%`, top: `${rowToPct(r)}%` }}
                aria-hidden
              />
            )
          }),
        )}
        {side.dots.map((d) => (
          <span
            key={`${d.col}-${d.row}`}
            className={['pm-pacdot-screen__dot', d.power ? 'is-power' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(d.col)}%`, top: `${rowToPct(d.row)}%` }}
            aria-hidden
          />
        ))}
        {side.ghosts.map((g) => {
          if (g.eatenUntil > now) return null
          return (
            <span
              key={g.id}
              className={['pm-pacdot-screen__ghost', powered ? 'is-scared' : ''].filter(Boolean).join(' ')}
              style={{ left: `${colToPct(g.col)}%`, top: `${rowToPct(g.row)}%` }}
              aria-hidden
            >
              👻
            </span>
          )
        })}
        {side.lives > 0 ? (
          <span
            className={['pm-pacdot-screen__player', invuln ? 'is-invuln' : '', powered ? 'is-powered' : '']
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${colToPct(side.playerCol)}%`, top: `${rowToPct(side.playerRow)}%` }}
            aria-hidden
          />
        ) : null}
        <div className="pm-pacdot-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-pacdot-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-pacdot-screen__dpad" role="group" aria-label="Yön">
          <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')}>
            ▲
          </button>
          <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')}>
            ◀
          </button>
          <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')}>
            ▼
          </button>
          <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')}>
            ▶
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function PacDotDuelArena({ p1, p2, now, disabled = false, onMove }: Props) {
  return (
    <div className="pm-pacdot-arena">
      <PacScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onMove={onMove} />
      <PacScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
