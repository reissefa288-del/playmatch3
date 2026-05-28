import type { CSSProperties } from 'react'
import type { DartLaneState, DartThrow } from '../utils/dartDuelEngine'

export type DartFlight = {
  fromX: number
  fromY: number
  toX: number
  toY: number
  active: boolean
}

type Props = {
  lane: DartLaneState
  accent: 'cyan' | 'pink'
  lastHit?: DartThrow | null
  flight?: DartFlight | null
  aimPreview?: number | null
}

export function DartBoard({ lane, accent, lastHit, flight, aimPreview }: Props) {
  const showStuck = lastHit && !flight?.active

  return (
    <div className={`pm-dart-board-wrap is-${accent}`}>
      <div className="pm-dart-board__meta">
        <span className="pm-dart-board__remain">{lane.remaining}</span>
        <span className="pm-dart-board__label">KALAN</span>
      </div>
      <div className={`pm-dart-board ${flight?.active ? 'is-flying' : ''} ${showStuck ? 'has-hit' : ''}`}>
        <span className="pm-dart-board__ring is-outer" />
        <span className="pm-dart-board__ring is-triple" />
        <span className="pm-dart-board__ring is-double" />
        <span className="pm-dart-board__ring is-single" />
        <span className="pm-dart-board__ring is-bull" />
        <span className="pm-dart-board__ring is-inner" />

        {aimPreview != null && !flight?.active ? (
          <span
            className="pm-dart-board__aim-line"
            style={{ left: `${aimPreview * 100}%` }}
            aria-hidden
          />
        ) : null}

        {flight?.active ? (
          <span
            className="pm-dart-board__dart is-flying"
            style={
              {
                '--dart-fx': `${flight.fromX * 100}%`,
                '--dart-fy': `${flight.fromY * 100}%`,
                '--dart-tx': `${flight.toX * 100}%`,
                '--dart-ty': `${flight.toY * 100}%`,
              } as CSSProperties
            }
            aria-hidden
          />
        ) : null}

        {showStuck ? (
          <span
            className="pm-dart-board__dart is-stuck"
            style={{ left: `${lastHit.x * 100}%`, top: `${lastHit.y * 100}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      <ul className="pm-dart-board__throws" aria-label="Son atışlar">
        {lane.lastThrows.map((t, i) => (
          <li key={i}>{t.score > 0 ? t.score : '—'}</li>
        ))}
        {Array.from({ length: Math.max(0, 3 - lane.lastThrows.length) }, (_, i) => (
          <li key={`e-${i}`} className="is-empty">
            ·
          </li>
        ))}
      </ul>
    </div>
  )
}
