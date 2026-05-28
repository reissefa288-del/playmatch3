import { useCallback, useRef } from 'react'
import { enemyGlyph, SHIP_Y, type GalagaSideState } from '../utils/galagaDuelEngine'

type Props = {
  p1: GalagaSideState
  p2: GalagaSideState
  now: number
  disabled?: boolean
  onShipX: (x: number) => void
  onFire: () => void
}

function GalagaScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onShipX,
  onFire,
}: {
  side: GalagaSideState
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
    <div className={['pm-galaga-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-galaga-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-galaga-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-galaga-screen__stars" aria-hidden />
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-galaga-screen__enemy', `is-${e.kind}`, e.mode === 'dive' ? 'is-diving' : ''].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span key={b.id} className="pm-galaga-screen__bullet is-player" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.enemyBullets.map((b) => (
          <span key={b.id} className="pm-galaga-screen__bullet is-enemy" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        <span
          className={['pm-galaga-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
          style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
          aria-hidden
        >
          ▲
        </span>
        <div className="pm-galaga-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-galaga-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <button
          type="button"
          className="pm-galaga-screen__fire"
          disabled={disabled || side.lives <= 0}
          onClick={onFire}
        >
          ATEŞ
        </button>
      ) : null}
    </div>
  )
}

export function GalagaDuelArena({ p1, p2, now, disabled = false, onShipX, onFire }: Props) {
  return (
    <div className="pm-galaga-arena">
      <GalagaScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onShipX={onShipX}
        onFire={onFire}
      />
      <GalagaScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
