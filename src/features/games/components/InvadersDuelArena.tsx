import { useCallback, useRef } from 'react'
import { invaderGlyph, SHIP_Y, type InvadersSideState } from '../utils/invadersDuelEngine'

type Props = {
  p1: InvadersSideState
  p2: InvadersSideState
  now: number
  disabled?: boolean
  onPointerShip: (clientX: number, rect: DOMRect) => void
  onFire: () => void
}

function InvadersScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onPointerShip,
  onFire,
}: {
  side: InvadersSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onPointerShip?: (clientX: number, rect: DOMRect) => void
  onFire?: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerShip) return
      onPointerShip(e.clientX, trackRef.current.getBoundingClientRect())
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onPointerShip],
  )

  return (
    <div className={['pm-invaders-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-invaders-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-invaders-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-invaders-screen__stars" aria-hidden />
        {side.shields.map((sh) => (
          <span
            key={sh.id}
            className="pm-invaders-screen__shield"
            style={{ left: `${sh.x}%`, top: `${sh.y}%`, opacity: 0.35 + sh.hp * 0.2 }}
            aria-hidden
          />
        ))}
        {side.invaders
          .filter((i) => i.alive)
          .map((inv) => (
            <span
              key={inv.id}
              className="pm-invaders-screen__invader"
              style={{ left: `${inv.x}%`, top: `${inv.y}%` }}
              aria-hidden
            >
              {invaderGlyph(inv.row)}
            </span>
          ))}
        {side.playerBullets.map((b) => (
          <span key={b.id} className="pm-invaders-screen__pbullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.enemyBullets.map((b) => (
          <span key={b.id} className="pm-invaders-screen__ebullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-invaders-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
            aria-hidden
          />
        ) : null}
        <div className="pm-invaders-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-invaders-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <button
          type="button"
          className="pm-invaders-screen__fire"
          disabled={disabled || side.lives <= 0}
          onClick={onFire}
        >
          ATEŞ
        </button>
      ) : null}
    </div>
  )
}

export function InvadersDuelArena({ p1, p2, now, disabled = false, onPointerShip, onFire }: Props) {
  return (
    <div className="pm-invaders-arena">
      <InvadersScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onPointerShip={onPointerShip}
        onFire={onFire}
      />
      <InvadersScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
