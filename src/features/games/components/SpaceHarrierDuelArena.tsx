import { useCallback, useRef } from 'react'
import {
  enemyGlyph,
  zToScale,
  zToTop,
  type SpaceHarrierSideState,
} from '../utils/spaceHarrierDuelEngine'

type Props = {
  p1: SpaceHarrierSideState
  p2: SpaceHarrierSideState
  now: number
  disabled?: boolean
  onPos: (px: number, py: number) => void
  onFire: () => void
}

function SpaceHarrierScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onPos,
  onFire,
}: {
  side: SpaceHarrierSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onPos?: (px: number, py: number) => void
  onFire?: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const pointerToPos = useCallback(
    (clientX: number, clientY: number) => {
      const el = trackRef.current
      if (!el || !onPos) return
      const rect = el.getBoundingClientRect()
      const px = ((clientX - rect.left) / rect.width) * 100
      const py = ((clientY - rect.top) / rect.height) * 100
      onPos(px, py)
    },
    [onPos],
  )

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled) return
      pointerToPos(e.clientX, e.clientY)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, pointerToPos],
  )

  return (
    <div className={['pm-sh-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-sh-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-sh-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div
          className="pm-sh-screen__ground"
          style={{ backgroundPosition: `50% ${side.scroll % 100}%` }}
          aria-hidden
        />
        <div className="pm-sh-screen__horizon" aria-hidden />
        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-sh-screen__enemy', `is-${e.kind}`].join(' ')}
            style={{
              left: `${e.x}%`,
              top: `${zToTop(e.z)}%`,
              transform: `translate(-50%, -50%) scale(${zToScale(e.z)})`,
            }}
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}
        {side.bullets.map((b) => (
          <span
            key={b.id}
            className="pm-sh-screen__bullet is-player"
            style={{
              left: `${b.x}%`,
              top: `${zToTop(b.z)}%`,
              transform: `translate(-50%, -50%) scale(${zToScale(b.z)})`,
            }}
          />
        ))}
        {side.enemyBullets.map((b) => (
          <span
            key={b.id}
            className="pm-sh-screen__bullet is-enemy"
            style={{
              left: `${b.x}%`,
              top: `${zToTop(b.z)}%`,
              transform: `translate(-50%, -50%) scale(${zToScale(b.z)})`,
            }}
          />
        ))}
        {side.lives > 0 ? (
          <span
            className={['pm-sh-screen__harrier', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
            style={{ left: `${side.px}%`, top: `${side.py}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      {interactive ? (
        <button type="button" className="pm-sh-screen__fire" disabled={disabled} onClick={onFire}>
          ATEŞ
        </button>
      ) : null}
    </div>
  )
}

export function SpaceHarrierDuelArena({ p1, p2, now, disabled = false, onPos, onFire }: Props) {
  return (
    <div className="pm-sh-arena">
      <SpaceHarrierScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onPos={onPos}
        onFire={onFire}
      />
      <SpaceHarrierScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
