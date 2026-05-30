import {
  COLS,
  ROWS,
  softBlocksLeft,
  TILE_HARD,
  TILE_SOFT,
  tileIndex,
  type BombermanSideState,
  type Dir,
} from '../utils/bombermanDuelEngine'

type Props = {
  p1: BombermanSideState
  p2: BombermanSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onBomb: () => void
}

function cellClass(side: BombermanSideState, col: number, row: number, now: number) {
  const t = side.tiles[tileIndex(col, row)] ?? TILE_HARD
  const classes = ['pm-bm-screen__cell']
  if (t === TILE_HARD) classes.push('is-hard')
  if (t === TILE_SOFT) classes.push('is-soft')
  if (side.bombs.some((b) => b.col === col && b.row === row)) classes.push('has-bomb')
  if (side.blasts.some((b) => now < b.until && b.cells.some((c) => c.col === col && c.row === row))) {
    classes.push('is-blast')
  }
  if (side.lives > 0 && side.col === col && side.row === row) classes.push('has-player')
  if (side.enemies.some((e) => e.col === col && e.row === row)) classes.push('has-enemy')
  return classes.join(' ')
}

function BombermanScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onBomb,
}: {
  side: BombermanSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onBomb?: () => void
}) {
  const invuln = now < side.invulnUntil
  const soft = softBlocksLeft(side.tiles)

  return (
    <div className={['pm-bm-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-bm-screen__label">{label}</p>
      <div className="pm-bm-screen__grid" role="presentation">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="pm-bm-screen__row">
            {Array.from({ length: COLS }, (_, col) => (
              <span key={col} className={cellClass(side, col, row, now)}>
                {side.lives > 0 && side.col === col && side.row === row ? (
                  <span className={['pm-bm-screen__bomber', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')} aria-hidden />
                ) : null}
                {side.enemies.some((e) => e.col === col && e.row === row) &&
                !(side.col === col && side.row === row) ? (
                  <span className="pm-bm-screen__enemy" aria-hidden />
                ) : null}
                {side.bombs.some((b) => b.col === col && b.row === row) ? (
                  <span className="pm-bm-screen__bomb" aria-hidden />
                ) : null}
              </span>
            ))}
          </div>
        ))}
        <p className="pm-bm-screen__soft">{soft} kutu</p>
      </div>
      {interactive ? (
        <div className="pm-bm-screen__controls">
          <div className="pm-bm-screen__steer" role="group" aria-label="Hareket">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <div className="pm-bm-screen__steer-mid">
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
          <button type="button" className="pm-bm-screen__bomb-btn" disabled={disabled} onClick={onBomb}>
            BOMBA
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function BombermanDuelArena({ p1, p2, now, disabled = false, onMove, onBomb }: Props) {
  return (
    <div className="pm-bm-arena">
      <BombermanScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onBomb={onBomb}
      />
      <BombermanScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
