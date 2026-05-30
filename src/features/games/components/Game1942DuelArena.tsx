import { useCallback, useRef } from 'react'
import { enemyGlyph, SHIP_Y, type Game1942SideState } from '../utils/game1942DuelEngine'

type Props = {
  p1: Game1942SideState
  p2: Game1942SideState
  now: number
  disabled?: boolean
  onShipX: (x: number) => void
  onFire: () => void
}

function Game1942Screen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onShipX,
  onFire,
}: {
  side: Game1942SideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onShipX?: (x: number) => void
  onFire?: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const pointerToX = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el || !onShipX) return
      const rect = el.getBoundingClientRect()
      const pct = ((clientX - rect.left) / rect.width) * 100
      onShipX(pct)
    },
    [onShipX],
  )

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled) return
      pointerToX(e.clientX)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, pointerToX],
  )

  return (
    <div className={['pm-y42-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-y42-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-y42-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
        style={{ '--y42-scroll': side.scrollY } as React.CSSProperties}
      >
        <div className="pm-y42-screen__ocean" aria-hidden />
        <div className="pm-y42-screen__clouds" aria-hidden />
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-y42-screen__enemy', `is-${e.kind}`, e.mode === 'dive' ? 'is-diving' : ''].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span key={b.id} className="pm-y42-screen__bullet is-player" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.enemyBullets.map((b) => (
          <span key={b.id} className="pm-y42-screen__bullet is-enemy" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        <span
          className={['pm-y42-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
          style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
          aria-hidden
        />
        <div className="pm-y42-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-y42-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <button
          type="button"
          className="pm-y42-screen__fire"
          disabled={disabled || side.lives <= 0}
          onClick={onFire}
        >
          ATEŞ
        </button>
      ) : null}
    </div>
  )
}

export function Game1942DuelArena({ p1, p2, now, disabled = false, onShipX, onFire }: Props) {
  return (
    <div className="pm-y42-arena">
      <Game1942Screen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onShipX={onShipX}
        onFire={onFire}
      />
      <Game1942Screen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
