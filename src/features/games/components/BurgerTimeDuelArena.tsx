import {
  colToPct,
  enemyGlyph,
  LADDER_COLS,
  partGlyph,
  PLATFORM_ROWS,
  rowToPct,
  type BurgerTimeSideState,
  type Dir,
} from '../utils/burgerTimeDuelEngine'

type Props = {
  p1: BurgerTimeSideState
  p2: BurgerTimeSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
}

function BurgerTimeScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
}: {
  side: BurgerTimeSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-burger-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-burger-screen__label">{label}</p>
      <div className="pm-burger-screen__track" role="presentation">
        {PLATFORM_ROWS.map((row) => (
          <span
            key={row}
            className="pm-burger-screen__platform"
            style={{ top: `${rowToPct(row)}%` }}
            aria-hidden
          />
        ))}
        {LADDER_COLS.map((col) => (
          <span
            key={col}
            className="pm-burger-screen__ladder"
            style={{ left: `${colToPct(col)}%` }}
            aria-hidden
          />
        ))}
        {side.parts
          .filter((p) => !p.dropped)
          .map((p) => (
            <span
              key={p.id}
              className="pm-burger-screen__part"
              style={{ left: `${colToPct(p.col)}%`, top: `${rowToPct(p.row)}%` }}
              aria-hidden
            >
              {partGlyph(p.layer)}
            </span>
          ))}
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-burger-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${colToPct(e.col)}%`, top: `${rowToPct(e.row)}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-burger-screen__chef', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.col)}%`, top: `${rowToPct(side.row)}%` }}
            aria-hidden
          >
            👨‍🍳
          </span>
        ) : null}
        <div className="pm-burger-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-burger-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-burger-screen__dpad" role="group" aria-label="Yön tuşları">
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

export function BurgerTimeDuelArena({ p1, p2, now, disabled = false, onMove }: Props) {
  return (
    <div className="pm-burger-arena">
      <BurgerTimeScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onMove={onMove} />
      <BurgerTimeScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
