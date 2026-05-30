import {
  COLS,
  enemiesLeft,
  ROWS,
  TILE_ICE,
  TILE_WALL,
  tileIndex,
  type Dir,
  type PengoSideState,
} from '../utils/pengoDuelEngine'

type Props = {
  p1: PengoSideState
  p2: PengoSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
}

function cellClass(side: PengoSideState, col: number, row: number) {
  const t = side.tiles[tileIndex(col, row)] ?? TILE_WALL
  const classes = ['pm-pg-screen__cell']
  if (t === TILE_WALL) classes.push('is-wall')
  if (t === TILE_ICE) classes.push('is-ice')
  if (side.lives > 0 && side.col === col && side.row === row) classes.push('has-player')
  if (side.enemies.some((e) => e.col === col && e.row === row)) classes.push('has-enemy')
  return classes.join(' ')
}

function PengoScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
}: {
  side: PengoSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
}) {
  const invuln = now < side.invulnUntil
  const foes = enemiesLeft(side)

  return (
    <div className={['pm-pg-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-pg-screen__label">{label}</p>
      <div className="pm-pg-screen__grid" role="presentation">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="pm-pg-screen__row">
            {Array.from({ length: COLS }, (_, col) => (
              <span key={col} className={cellClass(side, col, row)}>
                {side.lives > 0 && side.col === col && side.row === row ? (
                  <span className={['pm-pg-screen__pengo', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')} aria-hidden />
                ) : null}
                {side.enemies.some((e) => e.col === col && e.row === row) &&
                !(side.col === col && side.row === row) ? (
                  <span className="pm-pg-screen__enemy" aria-hidden />
                ) : null}
              </span>
            ))}
          </div>
        ))}
        <p className="pm-pg-screen__foes">{foes} arı</p>
      </div>
      {interactive ? (
        <div className="pm-pg-screen__controls">
          <div className="pm-pg-screen__steer" role="group" aria-label="Hareket">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <div className="pm-pg-screen__steer-mid">
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
        </div>
      ) : null}
    </div>
  )
}

export function PengoDuelArena({ p1, p2, now, disabled = false, onMove }: Props) {
  return (
    <div className="pm-pg-arena">
      <PengoScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
      />
      <PengoScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
