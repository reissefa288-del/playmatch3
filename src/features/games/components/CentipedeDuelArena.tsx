import { useCallback, useRef } from 'react'
import {
  colToPct,
  rowToPct,
  type CentipedeSideState,
} from '../utils/centipedeDuelEngine'

type Props = {
  p1: CentipedeSideState
  p2: CentipedeSideState
  now: number
  disabled?: boolean
  onAim: (clientX: number, rect: DOMRect) => void
  onFire: () => void
}

function CentipedeScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onAim,
  onFire,
}: {
  side: CentipedeSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onAim?: (clientX: number, rect: DOMRect) => void
  onFire?: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onAim) return
      onAim(e.clientX, trackRef.current.getBoundingClientRect())
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onAim],
  )

  return (
    <div className={['pm-centipede-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-centipede-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-centipede-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <div className="pm-centipede-screen__grid" aria-hidden />
        {side.mushrooms.map((m) => (
          <span
            key={`${m.col}-${m.row}`}
            className={['pm-centipede-screen__mushroom', `hp-${m.hp}`].join(' ')}
            style={{ left: `${colToPct(m.col)}%`, top: `${rowToPct(m.row)}%` }}
            aria-hidden
          />
        ))}
        {side.segments.map((s, i) => (
          <span
            key={s.id}
            className={['pm-centipede-screen__segment', i === 0 ? 'is-head' : ''].filter(Boolean).join(' ')}
            style={{ left: `${colToPct(s.col)}%`, top: `${rowToPct(s.row)}%` }}
            aria-hidden
          />
        ))}
        {side.bullet ? (
          <span
            className="pm-centipede-screen__bullet"
            style={{ left: `${colToPct(side.bullet.col)}%`, top: `${rowToPct(side.bullet.row)}%` }}
            aria-hidden
          />
        ) : null}
        <span
          className={['pm-centipede-screen__blaster', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
          style={{ left: `${colToPct(side.playerCol)}%`, top: `${rowToPct(12)}%` }}
          aria-hidden
        />
        <div className="pm-centipede-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-centipede-screen__life" />
          ))}
        </div>
      </div>
      {interactive ? (
        <button
          type="button"
          className="pm-centipede-screen__fire"
          disabled={disabled || side.lives <= 0}
          onClick={onFire}
        >
          ATEŞ
        </button>
      ) : null}
    </div>
  )
}

export function CentipedeDuelArena({ p1, p2, now, disabled = false, onAim, onFire }: Props) {
  return (
    <div className="pm-centipede-arena">
      <CentipedeScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onAim={onAim}
        onFire={onFire}
      />
      <CentipedeScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
