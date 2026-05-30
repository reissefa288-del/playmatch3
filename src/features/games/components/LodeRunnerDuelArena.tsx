import {
  COLS,
  goldLeft,
  ROWS,
  TILE_BRICK,
  TILE_HOLE,
  TILE_LADDER,
  TILE_SOLID,
  tileIndex,
  type DigDir,
  type Dir,
  type LodeRunnerSideState,
} from '../utils/lodeRunnerDuelEngine'

type Props = {
  p1: LodeRunnerSideState
  p2: LodeRunnerSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onDig: (dir: DigDir) => void
}

function cellClass(side: LodeRunnerSideState, col: number, row: number) {
  const t = side.tiles[tileIndex(col, row)] ?? TILE_SOLID
  const classes = ['pm-lr-screen__cell']
  if (t === TILE_SOLID) classes.push('is-wall')
  if (t === TILE_BRICK) classes.push('is-brick')
  if (t === TILE_LADDER) classes.push('is-ladder')
  if (t === TILE_HOLE) classes.push('is-hole')
  if (side.gold.includes(tileIndex(col, row))) classes.push('has-gold')
  if (side.lives > 0 && side.col === col && side.row === row) classes.push('has-player')
  if (side.enemies.some((e) => e.col === col && e.row === row)) classes.push('has-enemy')
  return classes.join(' ')
}

function LodeRunnerScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onDig,
}: {
  side: LodeRunnerSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onDig?: (dir: DigDir) => void
}) {
  const invuln = now < side.invulnUntil
  const gold = goldLeft(side)

  return (
    <div className={['pm-lr-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-lr-screen__label">{label}</p>
      <div className="pm-lr-screen__grid" role="presentation">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="pm-lr-screen__row">
            {Array.from({ length: COLS }, (_, col) => (
              <span key={col} className={cellClass(side, col, row)}>
                {side.gold.includes(tileIndex(col, row)) ? (
                  <span className="pm-lr-screen__gold" aria-hidden />
                ) : null}
                {side.lives > 0 && side.col === col && side.row === row ? (
                  <span className={['pm-lr-screen__runner', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')} aria-hidden />
                ) : null}
                {side.enemies.some((e) => e.col === col && e.row === row) &&
                !(side.col === col && side.row === row) ? (
                  <span className="pm-lr-screen__enemy" aria-hidden />
                ) : null}
              </span>
            ))}
          </div>
        ))}
        <p className="pm-lr-screen__gold-meta">{gold} altın</p>
      </div>
      {interactive ? (
        <div className="pm-lr-screen__controls">
          <div className="pm-lr-screen__steer" role="group" aria-label="Hareket">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <div className="pm-lr-screen__steer-mid">
              <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
                ◀
              </button>
              <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
                ▶
              </button>
            </div>
            <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')} aria-label="Aşağı">
              ▼
            </button>
          </div>
          <div className="pm-lr-screen__dig" role="group" aria-label="Kaz">
            <button type="button" disabled={disabled} onClick={() => onDig?.('left')}>
              ◖ KAZ
            </button>
            <button type="button" disabled={disabled} onClick={() => onDig?.('right')}>
              KAZ ▗
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LodeRunnerDuelArena({ p1, p2, now, disabled = false, onMove, onDig }: Props) {
  return (
    <div className="pm-lr-arena">
      <LodeRunnerScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onDig={onDig}
      />
      <LodeRunnerScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
