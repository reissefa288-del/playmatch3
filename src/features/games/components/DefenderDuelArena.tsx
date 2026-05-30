import { useCallback, useRef } from 'react'
import {
  enemyGlyph,
  HUMAN_Y,
  humansAlive,
  SHIP_X,
  type DefenderSideState,
  type VerticalDir,
} from '../utils/defenderDuelEngine'

type Props = {
  p1: DefenderSideState
  p2: DefenderSideState
  now: number
  disabled?: boolean
  onMove: (dir: VerticalDir) => void
  onFire: () => void
  onPointerShip: (clientY: number, rect: DOMRect) => void
}

function DefenderScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onMove,
  onFire,
  onPointerShip,
}: {
  side: DefenderSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: VerticalDir) => void
  onFire?: () => void
  onPointerShip?: (clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerShip) return
      onPointerShip(e.clientY, trackRef.current.getBoundingClientRect())
    },
    [disabled, interactive, onPointerShip],
  )

  return (
    <div className={['pm-def-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-def-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-def-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-def-screen__ground" aria-hidden />
        <div className="pm-def-screen__horizon" aria-hidden />

        {side.humans.map((h) => (
          <span
            key={h.id}
            className={['pm-def-screen__human', h.alive ? '' : 'is-lost'].filter(Boolean).join(' ')}
            style={{ left: `${h.x}%`, top: `${HUMAN_Y}%` }}
            aria-hidden
          >
            {h.alive ? '🧑' : '·'}
          </span>
        ))}

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-def-screen__enemy', `is-${e.kind}`, e.diving ? 'is-dive' : ''].filter(Boolean).join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-def-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy'].filter(Boolean).join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-def-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${SHIP_X}%`, top: `${side.shipY}%` }}
            aria-hidden
          />
        ) : null}

        <span className="pm-def-screen__humans-count" aria-hidden>
          {humansAlive(side)}/{side.humans.length}
        </span>
      </div>
      {interactive ? (
        <div className="pm-def-screen__controls">
          <div className="pm-def-screen__steer" role="group" aria-label="Yükseklik">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')} aria-label="Aşağı">
              ▼
            </button>
          </div>
          <button type="button" className="pm-def-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
      <div className="pm-def-screen__lives" aria-label={`${side.lives} can`}>
        {Array.from({ length: side.lives }, (_, i) => (
          <span key={i} className="pm-def-screen__life" />
        ))}
      </div>
    </div>
  )
}

export function DefenderDuelArena({ p1, p2, now, disabled = false, onMove, onFire, onPointerShip }: Props) {
  return (
    <div className="pm-def-arena">
      <DefenderScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onMove={onMove}
        onFire={onFire}
        onPointerShip={onPointerShip}
      />
      <DefenderScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
