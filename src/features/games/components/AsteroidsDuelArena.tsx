import { useCallback, useRef } from 'react'
import { rockScale, type AsteroidSideState } from '../utils/asteroidsDuelEngine'

type Props = {
  p1: AsteroidSideState
  p2: AsteroidSideState
  now: number
  disabled?: boolean
  onPointerAim: (clientX: number, clientY: number, rect: DOMRect) => void
  onThrust: (on: boolean) => void
  onFire: () => void
}

function shipDeg(angle: number) {
  return (angle * 180) / Math.PI
}

function AsteroidsScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onPointerAim,
  onThrust,
  onFire,
}: {
  side: AsteroidSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onPointerAim?: (clientX: number, clientY: number, rect: DOMRect) => void
  onThrust?: (on: boolean) => void
  onFire?: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerAim) return
      const rect = trackRef.current.getBoundingClientRect()
      onPointerAim(e.clientX, e.clientY, rect)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onPointerAim],
  )

  return (
    <div className={['pm-asteroids-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-asteroids-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-asteroids-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-asteroids-screen__stars" aria-hidden />
        {side.asteroids.map((a) => (
          <span
            key={a.id}
            className={['pm-asteroids-screen__rock', `is-${a.size}`].join(' ')}
            style={{
              left: `${a.x}%`,
              top: `${a.y}%`,
              transform: `translate(-50%, -50%) rotate(${a.rot}rad) scale(${rockScale(a.size)})`,
            }}
            aria-hidden
          />
        ))}
        {side.bullets.map((b) => (
          <span key={b.id} className="pm-asteroids-screen__bullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-asteroids-screen__ship', invuln ? 'is-invuln' : '', side.thrusting ? 'is-thrust' : '']
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${side.shipX}%`,
              top: `${side.shipY}%`,
              transform: `translate(-50%, -50%) rotate(${shipDeg(side.shipAngle)}deg)`,
            }}
            aria-hidden
          />
        ) : null}
        <div className="pm-asteroids-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-asteroids-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-asteroids-screen__controls">
          <button
            type="button"
            className="pm-asteroids-screen__btn is-thrust"
            disabled={disabled || side.lives <= 0}
            onPointerDown={() => onThrust?.(true)}
            onPointerUp={() => onThrust?.(false)}
            onPointerLeave={() => onThrust?.(false)}
          >
            İT
          </button>
          <button
            type="button"
            className="pm-asteroids-screen__btn is-fire"
            disabled={disabled || side.lives <= 0}
            onClick={onFire}
          >
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AsteroidsDuelArena({
  p1,
  p2,
  now,
  disabled = false,
  onPointerAim,
  onThrust,
  onFire,
}: Props) {
  return (
    <div className="pm-asteroids-arena">
      <AsteroidsScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onPointerAim={onPointerAim}
        onThrust={onThrust}
        onFire={onFire}
      />
      <AsteroidsScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
