import { useCallback, useRef } from 'react'
import {
  currentEra,
  enemyGlyph,
  eraLabel,
  type Dir,
  type TimePilotSideState,
} from '../utils/timePilotDuelEngine'

type Props = {
  p1: TimePilotSideState
  p2: TimePilotSideState
  now: number
  disabled?: boolean
  onMove: (dir: Dir) => void
  onFire: () => void
  onPointerShip: (clientX: number, clientY: number, rect: DOMRect) => void
}

function aimIndicator(aim: Dir) {
  if (aim === 'up') return '↑'
  if (aim === 'down') return '↓'
  if (aim === 'left') return '←'
  return '→'
}

function TimePilotScreen({
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
  side: TimePilotSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onMove?: (dir: Dir) => void
  onFire?: () => void
  onPointerShip?: (clientX: number, clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil
  const era = currentEra(side)

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerShip) return
      onPointerShip(e.clientX, e.clientY, trackRef.current.getBoundingClientRect())
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onPointerShip],
  )

  return (
    <div
      className={['pm-tp-screen', `is-${accent}`, `is-era-${era}`, interactive ? 'is-you' : 'is-rival'].join(' ')}
    >
      <p className="pm-tp-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-tp-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-tp-screen__sky" aria-hidden />
        <span className="pm-tp-screen__era" aria-hidden>
          {eraLabel(side)}
        </span>

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-tp-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span key={b.id} className="pm-tp-screen__bullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-tp-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py}%` }}
            aria-hidden
          >
            <span className="pm-tp-screen__aim">{aimIndicator(side.aim)}</span>
          </span>
        ) : null}

        <div className="pm-tp-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-tp-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-tp-screen__controls">
          <div className="pm-tp-screen__dpad" role="group" aria-label="Yön">
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
          <button type="button" className="pm-tp-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function TimePilotDuelArena({ p1, p2, now, disabled = false, onMove, onFire, onPointerShip }: Props) {
  return (
    <div className="pm-tp-arena">
      <TimePilotScreen
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
      <TimePilotScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
