import type { CSSProperties } from 'react'
import type { LaneId, RhythmNote } from '../utils/rhythmDuelEngine'
import { noteProgress } from '../utils/rhythmDuelEngine'

const LANE_COLORS = ['#ff4d8d', '#5ecbff', '#b8ff3d', '#ffc25f'] as const

type Props = {
  notes: RhythmNote[]
  now: number
  lastGrade: 'perfect' | 'good' | 'miss' | null
  combo: number
  disabled?: boolean
  onTap: (lane: LaneId) => void
}

export function RhythmDuelArena({ notes, now, lastGrade, combo, disabled = false, onTap }: Props) {
  const active = notes.filter((n) => !n.resolved && noteProgress(n, now) < 1.15)

  return (
    <div className={['pm-rhythm-arena', disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}>
      <div className="pm-rhythm-arena__grid" aria-hidden>
        {([0, 1, 2, 3] as LaneId[]).map((lane) => (
          <span key={lane} className="pm-rhythm-arena__lane" />
        ))}
      </div>
      <div className="pm-rhythm-arena__lanes" aria-hidden>
        {active.map((n) => {
          const p = noteProgress(n, now)
          return (
            <span
              key={n.id}
              className="pm-rhythm-arena__note"
              style={{
                left: `${12.5 + n.lane * 25}%`,
                top: `${Math.min(92, p * 88)}%`,
                background: LANE_COLORS[n.lane],
              }}
            />
          )
        })}
      </div>
      <div className="pm-rhythm-arena__hitline" aria-hidden />
      {lastGrade ? (
        <span className={`pm-rhythm-arena__fx is-${lastGrade}`}>
          {lastGrade === 'perfect' ? 'PERFECT' : lastGrade === 'good' ? 'GOOD' : 'MISS'}
        </span>
      ) : null}
      {combo > 2 ? <span className="pm-rhythm-arena__combo">x{combo}</span> : null}
      <div className="pm-rhythm-arena__pads" role="group" aria-label="Ritim şeritleri">
        {([0, 1, 2, 3] as LaneId[]).map((lane) => (
          <button
            key={lane}
            type="button"
            className="pm-rhythm-arena__pad"
            style={{ '--lane-color': LANE_COLORS[lane] } as CSSProperties}
            disabled={disabled}
            onClick={() => onTap(lane)}
            aria-label={`Şerit ${lane + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
