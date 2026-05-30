import {
  colToPct,
  COLS,
  isBoosting,
  playerWorldY,
  trafficGlyph,
  worldToPct,
  type Dir,
  type OutRunSideState,
} from '../utils/outRunDuelEngine'

type Props = {
  p1: OutRunSideState
  p2: OutRunSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onBoost: () => void
}

function OutRunScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onBoost,
}: {
  side: OutRunSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onBoost?: () => void
}) {
  const invuln = now < side.invulnUntil
  const boost = isBoosting(side, now)
  const scroll = side.scroll
  const playerY = worldToPct(playerWorldY(scroll), scroll)

  return (
    <div className={['pm-or-screen', `is-${accent}`, boost ? 'is-boost' : '', interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-or-screen__label">{label}</p>
      <div className="pm-or-screen__track" role="presentation">
        <div className="pm-or-screen__sky" aria-hidden />
        <div className="pm-or-screen__road" aria-hidden />
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <span
            key={i}
            className="pm-or-screen__lane-line"
            style={{ left: `${((i + 1) / COLS) * 100}%` }}
            aria-hidden
          />
        ))}

        {side.hazards.map((h) => {
          const top = worldToPct(h.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={h.id}
              className="pm-or-screen__hazard"
              style={{ left: `${colToPct(h.col)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.traffic.map((t) => {
          const top = worldToPct(t.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={t.id}
              className={['pm-or-screen__traffic', `is-${t.kind}`, t.passed ? 'is-passed' : ''].filter(Boolean).join(' ')}
              style={{ left: `${colToPct(t.col)}%`, top: `${top}%` }}
              aria-hidden
            >
              {trafficGlyph(t.kind)}
            </span>
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-or-screen__car', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(side.playerCol)}%`, top: `${playerY}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-or-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-or-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-or-screen__controls">
          <div className="pm-or-screen__steer" role="group" aria-label="Direksiyon">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-or-screen__boost" disabled={disabled} onClick={onBoost}>
            NİTRO
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function OutRunDuelArena({ p1, p2, now, disabled = false, onMove, onBoost }: Props) {
  return (
    <div className="pm-or-arena">
      <OutRunScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onBoost={onBoost}
      />
      <OutRunScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
