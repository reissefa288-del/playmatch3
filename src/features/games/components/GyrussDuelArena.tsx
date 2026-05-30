import { useCallback, useRef } from 'react'
import {
  CX,
  CY,
  enemyGlyph,
  shipPosition,
  type GyrussSideState,
  type OrbitDir,
} from '../utils/gyrussDuelEngine'

type Props = {
  p1: GyrussSideState
  p2: GyrussSideState
  now: number
  disabled?: boolean
  onOrbit: (dir: OrbitDir) => void
  onFire: () => void
  onPointerOrbit: (clientX: number, clientY: number, rect: DOMRect) => void
}

function GyrussScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onOrbit,
  onFire,
  onPointerOrbit,
}: {
  side: GyrussSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onOrbit?: (dir: OrbitDir) => void
  onFire?: () => void
  onPointerOrbit?: (clientX: number, clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil
  const ship = shipPosition(side.angle)

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerOrbit) return
      onPointerOrbit(e.clientX, e.clientY, trackRef.current.getBoundingClientRect())
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onPointerOrbit],
  )

  return (
    <div className={['pm-gyr-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-gyr-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-gyr-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
        style={{ '--gyr-tunnel': side.tunnelPhase } as React.CSSProperties}
      >
        <div className="pm-gyr-screen__tunnel" aria-hidden />
        <div className="pm-gyr-screen__ring" aria-hidden />
        <span className="pm-gyr-screen__core" style={{ left: `${CX}%`, top: `${CY}%` }} aria-hidden />

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-gyr-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span key={b.id} className="pm-gyr-screen__bullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-gyr-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${ship.px}%`, top: `${ship.py}%` }}
            aria-hidden
          />
        ) : null}

        <div className="pm-gyr-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-gyr-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-gyr-screen__controls">
          <div className="pm-gyr-screen__orbit" role="group" aria-label="Yörünge">
            <button type="button" disabled={disabled} onClick={() => onOrbit?.('left')} aria-label="Saat yönü tersi">
              ↺
            </button>
            <button type="button" disabled={disabled} onClick={() => onOrbit?.('right')} aria-label="Saat yönü">
              ↻
            </button>
          </div>
          <button type="button" className="pm-gyr-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function GyrussDuelArena({ p1, p2, now, disabled = false, onOrbit, onFire, onPointerOrbit }: Props) {
  return (
    <div className="pm-gyr-arena">
      <GyrussScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onOrbit={onOrbit}
        onFire={onFire}
        onPointerOrbit={onPointerOrbit}
      />
      <GyrussScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
