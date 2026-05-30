import { useCallback, useRef } from 'react'
import { EXPLODE_RADIUS, type McSideState } from '../utils/missileCommandDuelEngine'

type Props = {
  p1: McSideState
  p2: McSideState
  now: number
  disabled?: boolean
  onFire: (clientX: number, clientY: number, rect: DOMRect) => void
}

function CommandScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onFire,
}: {
  side: McSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onFire?: (clientX: number, clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onFire) return
      onFire(e.clientX, e.clientY, trackRef.current.getBoundingClientRect())
    },
    [disabled, interactive, onFire],
  )

  return (
    <div className={['pm-missile-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-missile-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-missile-screen__track"
        onPointerDown={handlePointer}
        role="presentation"
      >
        <div className="pm-missile-screen__sky" aria-hidden />
        {side.cities.map((c) => (
          <span
            key={c.id}
            className={['pm-missile-screen__city', c.alive ? '' : 'is-dead'].filter(Boolean).join(' ')}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            aria-hidden
          />
        ))}
        {[25, 50, 75].map((x) => (
          <span key={x} className="pm-missile-screen__battery" style={{ left: `${x}%` }} aria-hidden />
        ))}
        {side.incoming.map((m) => (
          <span
            key={m.id}
            className="pm-missile-screen__incoming"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            aria-hidden
          />
        ))}
        {side.counters.map((c) => {
          if (c.phase === 'boom' && c.boomUntil <= now) return null
          if (c.phase === 'boom') {
            return (
              <span
                key={c.id}
                className="pm-missile-screen__boom"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: `${EXPLODE_RADIUS * 2}%`,
                  height: `${EXPLODE_RADIUS * 2}%`,
                }}
                aria-hidden
              />
            )
          }
          return (
            <span key={c.id} className="pm-missile-screen__counter" style={{ left: `${c.x}%`, top: `${c.y}%` }} />
          )
        })}
      </div>
    </div>
  )
}

export function MissileCommandDuelArena({ p1, p2, now, disabled = false, onFire }: Props) {
  return (
    <div className="pm-missile-arena">
      <CommandScreen side={p1} label="SEN" accent="cyan" now={now} interactive disabled={disabled} onFire={onFire} />
      <CommandScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
