import { enemyGlyph, type Dir, type RobotronSideState } from '../utils/robotronDuelEngine'

type Props = {
  p1: RobotronSideState
  p2: RobotronSideState
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

function RobotronScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onFire,
}: {
  side: RobotronSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onFire?: () => void
}) {
  const invuln = now < side.invulnUntil

  return (
    <div className={['pm-robotron-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-robotron-screen__label">{label}</p>
      <div className="pm-robotron-screen__track" role="presentation">
        <div className="pm-robotron-screen__grid" aria-hidden />
        {side.humans
          .filter((h) => !h.saved)
          .map((h) => (
            <span
              key={h.id}
              className="pm-robotron-screen__human"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-hidden
            >
              👤
            </span>
          ))}
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-robotron-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span key={b.id} className="pm-robotron-screen__bullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-robotron-screen__player', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py}%` }}
            aria-hidden
          >
            <span className="pm-robotron-screen__aim">{aimIndicator(side.aim)}</span>
          </span>
        ) : null}
        <div className="pm-robotron-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-robotron-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-robotron-screen__controls">
          <div className="pm-robotron-screen__dpad" role="group" aria-label="Hareket">
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
          <button type="button" className="pm-robotron-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function RobotronDuelArena({ p1, p2, now, disabled = false, onMove, onFire }: Props) {
  return (
    <div className="pm-robotron-arena">
      <RobotronScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onFire={onFire}
      />
      <RobotronScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
