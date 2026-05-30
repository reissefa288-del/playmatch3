import type { CSSProperties } from 'react'
import {
  COLS,
  isOnTrail,
  isSprinting,
  laneToScreenPct,
  playerWorldY,
  riderGlyph,
  trailCenterAt,
  weatherAt,
  weatherLabel,
  worldToPct,
  type Dir,
  type EnduroSideState,
} from '../utils/enduroDuelEngine'

type Props = {
  p1: EnduroSideState
  p2: EnduroSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onSprint: () => void
}

function EnduroScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onSprint,
}: {
  side: EnduroSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onSprint?: () => void
}) {
  const invuln = now < side.invulnUntil
  const sprint = isSprinting(side, now)
  const scroll = side.scroll
  const curve = trailCenterAt(scroll)
  const weather = weatherAt(scroll)
  const onTrail = isOnTrail(side.playerLane, scroll)
  const playerY = worldToPct(playerWorldY(scroll), scroll)

  return (
    <div
      className={[
        'pm-en-screen',
        `is-${accent}`,
        `is-${weather}`,
        sprint ? 'is-sprint' : '',
        onTrail ? '' : 'is-offtrail',
        interactive ? 'is-you' : 'is-rival',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="pm-en-screen__label">{label}</p>
      <p className="pm-en-screen__weather">{weatherLabel(weather)}</p>
      <div
        className="pm-en-screen__track"
        style={{ '--en-curve': `${curve * 12}%` } as CSSProperties}
        role="presentation"
      >
        <div className="pm-en-screen__sky" aria-hidden />
        <div className="pm-en-screen__hills" aria-hidden />
        <div className="pm-en-screen__trail" aria-hidden>
          {Array.from({ length: COLS - 1 }, (_, i) => (
            <span
              key={i}
              className="pm-en-screen__lane-line"
              style={{ left: `${((i + 1) / COLS) * 100}%` }}
              aria-hidden
            />
          ))}
        </div>

        {side.hazards.map((h) => {
          const top = worldToPct(h.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={h.id}
              className={['pm-en-screen__hazard', `is-${h.kind}`].join(' ')}
              style={{ left: `${laneToScreenPct(h.lane, scroll)}%`, top: `${top}%` }}
              aria-hidden
            />
          )
        })}

        {side.riders.map((r) => {
          const top = worldToPct(r.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={r.id}
              className={['pm-en-screen__rider', `is-${r.kind}`, r.passed ? 'is-passed' : '']
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${laneToScreenPct(r.lane, scroll)}%`, top: `${top}%` }}
              aria-hidden
            >
              {riderGlyph(r.kind)}
            </span>
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-en-screen__bike', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${laneToScreenPct(side.playerLane, scroll)}%`, top: `${playerY}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-en-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-en-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-en-screen__controls">
          <div className="pm-en-screen__steer" role="group" aria-label="Direksiyon">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-en-screen__sprint" disabled={disabled} onClick={onSprint}>
            SPRINT
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function EnduroDuelArena({ p1, p2, now, disabled = false, onMove, onSprint }: Props) {
  return (
    <div className="pm-en-arena">
      <EnduroScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onSprint={onSprint}
      />
      <EnduroScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
