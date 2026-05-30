import { useCallback, useRef } from 'react'
import {
  enemyGlyph,
  powerLabel,
  SHIP_X,
  type GradiusSideState,
  type VerticalDir,
} from '../utils/gradiusDuelEngine'

type Props = {
  p1: GradiusSideState
  p2: GradiusSideState
  now: number
  disabled?: boolean
  onMove: (dir: VerticalDir) => void
  onFire: () => void
  onPointerShip: (clientY: number, rect: DOMRect) => void
}

function GradiusScreen({
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
  side: GradiusSideState
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
    <div className={['pm-grd-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-grd-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-grd-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
        style={{ '--grd-scroll': side.scrollPhase } as React.CSSProperties}
      >
        <div className="pm-grd-screen__parallax" aria-hidden />
        <div className="pm-grd-screen__grid" aria-hidden />

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-grd-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.capsules.map((c) => (
          <span key={c.id} className="pm-grd-screen__capsule" style={{ left: `${c.x}%`, top: `${c.y}%` }} aria-hidden>
            P
          </span>
        ))}

        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-grd-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy'].filter(Boolean).join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          />
        ))}

        {side.lives > 0 ? (
          <span
            className={['pm-grd-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${SHIP_X}%`, top: `${side.shipY}%` }}
            aria-hidden
          />
        ) : null}

        <span className="pm-grd-screen__power" aria-hidden>
          {powerLabel(side.power)}
        </span>

        <div className="pm-grd-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-grd-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <div className="pm-grd-screen__controls">
          <div className="pm-grd-screen__steer" role="group" aria-label="Yükseklik">
            <button type="button" className="is-up" disabled={disabled} onClick={() => onMove?.('up')} aria-label="Yukarı">
              ▲
            </button>
            <button type="button" className="is-down" disabled={disabled} onClick={() => onMove?.('down')} aria-label="Aşağı">
              ▼
            </button>
          </div>
          <button type="button" className="pm-grd-screen__fire" disabled={disabled} onClick={onFire}>
            ATEŞ
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function GradiusDuelArena({ p1, p2, now, disabled = false, onMove, onFire, onPointerShip }: Props) {
  return (
    <div className="pm-grd-arena">
      <GradiusScreen
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
      <GradiusScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
