import {
  enemyGlyph,
  LANES,
  laneDepthToPosition,
  laneToAngle,
  type RotateDir,
  type TempestSideState,
} from '../utils/tempestDuelEngine'

type Props = {
  p1: TempestSideState
  p2: TempestSideState
  now: number
  disabled?: boolean
  onRotate: (dir: RotateDir) => void
  onFire: () => void
}

function laneLinePoints() {
  const cx = 50
  const cy = 54
  const inner = 14
  const outer = 40
  return Array.from({ length: LANES }, (_, lane) => {
    const a = laneToAngle(lane)
    return {
      lane,
      x1: cx + Math.cos(a) * inner,
      y1: cy + Math.sin(a) * inner * 0.92,
      x2: cx + Math.cos(a) * outer,
      y2: cy + Math.sin(a) * outer * 0.92,
    }
  })
}

const LANE_LINES = laneLinePoints()

function TempestScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onRotate,
  onFire,
}: {
  side: TempestSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onRotate?: (dir: RotateDir) => void
  onFire?: () => void
}) {
  const invuln = now < side.invulnUntil
  const playerPos = laneDepthToPosition(side.lane, 0.3)

  return (
    <div className={['pm-tempest-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-tempest-screen__label">{label}</p>
      <div className="pm-tempest-screen__track" role="presentation">
        <svg className="pm-tempest-screen__well" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <polygon
            className="pm-tempest-screen__ring is-outer"
            points="50,8 88,28 88,72 50,92 12,72 12,28"
            fill="none"
          />
          <polygon
            className="pm-tempest-screen__ring is-mid"
            points="50,22 74,34 74,66 50,78 26,66 26,34"
            fill="none"
          />
          <polygon
            className="pm-tempest-screen__ring is-inner"
            points="50,32 64,40 64,60 50,68 36,60 36,40"
            fill="none"
          />
          {LANE_LINES.map((ln) => (
            <line
              key={ln.lane}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              className={ln.lane === side.lane ? 'is-active' : ''}
            />
          ))}
        </svg>

        {side.bullets.map((b) => {
          const pos = laneDepthToPosition(b.lane, b.depth)
          return (
            <span
              key={b.id}
              className="pm-tempest-screen__bullet"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              aria-hidden
            />
          )
        })}

        {side.enemies.map((e) => {
          const pos = laneDepthToPosition(e.lane, e.depth)
          return (
            <span
              key={e.id}
              className={['pm-tempest-screen__enemy', `is-${e.kind}`].join(' ')}
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              aria-hidden
            >
              {enemyGlyph(e.kind)}
            </span>
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-tempest-screen__blaster', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${playerPos.left}%`, top: `${playerPos.top}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-tempest-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-tempest-screen__life" />
          ))}
        </div>
      </div>

      {interactive ? (
        <div className="pm-tempest-screen__controls">
          <button type="button" className="is-left" disabled={disabled} onClick={() => onRotate?.('left')} aria-label="Sola dön">
            ◀
          </button>
          <button type="button" className="pm-tempest-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
          <button type="button" className="is-right" disabled={disabled} onClick={() => onRotate?.('right')} aria-label="Sağa dön">
            ▶
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function TempestDuelArena({ p1, p2, now, disabled = false, onRotate, onFire }: Props) {
  return (
    <div className="pm-tempest-arena">
      <TempestScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onRotate={onRotate}
        onFire={onFire}
      />
      <TempestScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
