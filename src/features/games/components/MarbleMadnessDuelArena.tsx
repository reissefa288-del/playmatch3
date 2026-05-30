import {
  colToPct,
  COLS,
  gemKey,
  MAZE,
  rowToPct,
  ROWS,
  type Dir,
  type MarbleMadnessSideState,
} from '../utils/marbleMadnessDuelEngine'

type Props = {
  p1: MarbleMadnessSideState
  p2: MarbleMadnessSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
}

function MarbleScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
}: {
  side: MarbleMadnessSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-mm-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-mm-screen__label">{label}</p>
      <div className="pm-mm-screen__maze" role="presentation">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="pm-mm-screen__row">
            {Array.from({ length: COLS }, (_, col) => {
              const cell = MAZE[row]![col] ?? 0
              const key = gemKey(row, col)
              const gemTaken = side.gemsTaken.includes(key)
              return (
                <span
                  key={col}
                  className={[
                    'pm-mm-screen__cell',
                    cell === 0 ? 'is-wall' : '',
                    cell === 1 ? 'is-path' : '',
                    cell === 2 ? 'is-pit' : '',
                    cell === 3 ? (gemTaken ? 'is-gem-taken' : 'is-gem') : '',
                    cell === 9 ? 'is-goal' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )
            })}
          </div>
        ))}

        {side.hunters.map((h) => (
          <span
            key={h.id}
            className="pm-mm-screen__hunter"
            style={{ left: `${colToPct(h.col)}%`, top: `${rowToPct(h.row)}%` }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-mm-screen__marble', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.col)}%`, top: `${rowToPct(side.row)}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      {interactive ? (
        <div className="pm-mm-screen__dpad" role="group" aria-label="Yön">
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
      <div className="pm-mm-screen__lives" aria-label={`${side.lives} can`}>
        {Array.from({ length: side.lives }, (_, i) => (
          <span key={i} className="pm-mm-screen__life" />
        ))}
      </div>
    </div>
  )
}

export function MarbleMadnessDuelArena({ p1, p2, now, disabled = false, onMove }: Props) {
  return (
    <div className="pm-mm-arena">
      <MarbleScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onMove={onMove} />
      <MarbleScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
