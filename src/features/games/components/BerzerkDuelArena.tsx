import { MAZE_WALLS, robotGlyph, type BerzerkSideState, type Dir } from '../utils/berzerkDuelEngine'

type Props = {
  p1: BerzerkSideState
  p2: BerzerkSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onFire: () => void
}

function aimIndicator(aim: Dir) {
  if (aim === 'up') return '↑'
  if (aim === 'down') return '↓'
  if (aim === 'left') return '←'
  return '→'
}

function BerzerkScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onFire,
}: {
  side: BerzerkSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onFire?: () => void
}) {
  const invuln = now < side.invulnUntil
  const ottoActive = side.robots.some((r) => r.kind === 'otto')

  return (
    <div className={['pm-bz-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-bz-screen__label">{label}</p>
      <div className="pm-bz-screen__track" role="presentation">
        <div className="pm-bz-screen__maze" aria-hidden />
        {MAZE_WALLS.map((w, i) => (
          <span
            key={i}
            className="pm-bz-screen__wall"
            style={{ left: `${w.x}%`, top: `${w.y}%`, width: `${w.w}%`, height: `${w.h}%` }}
            aria-hidden
          />
        ))}
        {side.robots.map((r) => (
          <span
            key={r.id}
            className={['pm-bz-screen__robot', `is-${r.kind}`].join(' ')}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            aria-hidden
          >
            {robotGlyph(r.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-bz-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy'].filter(Boolean).join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-bz-screen__player', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py}%` }}
            aria-hidden
          >
            <span className="pm-bz-screen__aim">{aimIndicator(side.aim)}</span>
          </span>
        ) : null}
        {ottoActive ? <span className="pm-bz-screen__otto-warn" aria-hidden>OTTO!</span> : null}
        <div className="pm-bz-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-bz-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-bz-screen__controls">
          <div className="pm-bz-screen__dpad" role="group" aria-label="Yön">
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
          <button type="button" className="pm-bz-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function BerzerkDuelArena({ p1, p2, now, disabled = false, onMove, onFire }: Props) {
  return (
    <div className="pm-bz-arena">
      <BerzerkScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onFire={onFire}
      />
      <BerzerkScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
