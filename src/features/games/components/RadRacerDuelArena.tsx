import type { CSSProperties } from 'react'
import {
  COLS,
  isOnRoad,
  isTurboing,
  laneToScreenPct,
  playerWorldY,
  roadCenterAt,
  trafficGlyph,
  worldToPct,
  type Dir,
  type RadRacerSideState,
} from '../utils/radRacerDuelEngine'

type Props = {
  p1: RadRacerSideState
  p2: RadRacerSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onTurbo: () => void
}

function RadRacerScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onTurbo,
}: {
  side: RadRacerSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onTurbo?: () => void
}) {
  const invuln = now < side.invulnUntil
  const turbo = isTurboing(side, now)
  const scroll = side.scroll
  const curve = roadCenterAt(scroll)
  const onRoad = isOnRoad(side.playerLane, scroll)
  const playerY = worldToPct(playerWorldY(scroll), scroll)

  return (
    <div
      className={[
        'pm-rr-screen',
        `is-${accent}`,
        turbo ? 'is-turbo' : '',
        onRoad ? '' : 'is-offroad',
        interactive ? 'is-you' : 'is-rival',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="pm-rr-screen__label">{label}</p>
      <div
        className="pm-rr-screen__track"
        style={{ '--rr-curve': `${curve * 12}%` } as CSSProperties}
        role="presentation"
      >
        <div className="pm-rr-screen__sky" aria-hidden />
        <div className="pm-rr-screen__horizon" aria-hidden />
        <div className="pm-rr-screen__road" aria-hidden>
          {Array.from({ length: COLS - 1 }, (_, i) => (
            <span
              key={i}
              className="pm-rr-screen__lane-line"
              style={{ left: `${((i + 1) / COLS) * 100}%` }}
              aria-hidden
            />
          ))}
        </div>

        {side.traffic.map((t) => {
          const top = worldToPct(t.worldY, scroll)
          if (top < 4 || top > 94) return null
          return (
            <span
              key={t.id}
              className={['pm-rr-screen__traffic', `is-${t.kind}`, t.passed ? 'is-passed' : '']
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${laneToScreenPct(t.lane, scroll)}%`, top: `${top}%` }}
              aria-hidden
            >
              {trafficGlyph(t.kind)}
            </span>
          )
        })}

        {side.lives > 0 ? (
          <span
            className={['pm-rr-screen__car', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${laneToScreenPct(side.playerLane, scroll)}%`, top: `${playerY}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-rr-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-rr-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-rr-screen__controls">
          <div className="pm-rr-screen__steer" role="group" aria-label="Direksiyon">
            <button type="button" className="is-left" disabled={disabled} onClick={() => onMove?.('left')} aria-label="Sol">
              ◀
            </button>
            <button type="button" className="is-right" disabled={disabled} onClick={() => onMove?.('right')} aria-label="Sağ">
              ▶
            </button>
          </div>
          <button type="button" className="pm-rr-screen__turbo" disabled={disabled} onClick={onTurbo}>
            TURBO
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function RadRacerDuelArena({ p1, p2, now, disabled = false, onMove, onTurbo }: Props) {
  return (
    <div className="pm-rr-arena">
      <RadRacerScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onTurbo={onTurbo}
      />
      <RadRacerScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
