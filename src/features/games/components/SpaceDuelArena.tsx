import { useCallback, useRef } from 'react'
import { enemyLabel, SHIP_Y, type SpaceSideState } from '../utils/spaceDuelEngine'

type Props = {
  p1: SpaceSideState
  p2: SpaceSideState
  now: number
  disabled?: boolean
  onShipX: (x: number) => void
}

function SpaceScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onShipX,
}: {
  side: SpaceSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onShipX?: (x: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil
  const waveFlash = now < side.waveFlashUntil

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
    <div className={['pm-space-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <div className="pm-space-screen__meta">
        <p className="pm-space-screen__label">{label}</p>
        <span className="pm-space-screen__wave">DALGA {side.wave}</span>
      </div>
      <div
        ref={trackRef}
        className={['pm-space-screen__track', waveFlash ? 'is-wave-flash' : ''].filter(Boolean).join(' ')}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-space-screen__nebula" aria-hidden />
        <div className="pm-space-screen__stars" aria-hidden />
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-space-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            {enemyLabel(e.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span key={b.id} className="pm-space-screen__bullet is-player" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        {side.enemyBullets.map((b) => (
          <span key={b.id} className="pm-space-screen__bullet is-enemy" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
        <span
          className={['pm-space-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
          style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
          aria-hidden
        >
          ✦
        </span>
        <div className="pm-space-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-space-screen__life" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SpaceDuelArena({ p1, p2, now, disabled = false, onShipX }: Props) {
  return (
    <div className="pm-space-arena">
      <SpaceScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onShipX={onShipX}
      />
      <SpaceScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
