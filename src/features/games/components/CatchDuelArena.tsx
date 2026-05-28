import { ICON_EMOJI, itemY, type CatchSideState, type LaneId } from '../utils/catchDuelEngine'

type Props = {
  p1: CatchSideState
  p2: CatchSideState
  now: number
  disabled?: boolean
  onCatch: (lane: LaneId) => void
}

function CatchScreen({
  side,
  label,
  accent,
  now,
  interactive,
  disabled,
  onCatch,
}: {
  side: CatchSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  interactive: boolean
  disabled?: boolean
  onCatch?: (lane: LaneId) => void
}) {
  const active = side.items.filter((it) => !it.caught && itemY(it, now) < 105)

  return (
    <div className={['pm-catch-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-catch-screen__label">{label}</p>
      <div className="pm-catch-screen__track">
        {active.map((it) => {
          const y = itemY(it, now)
          return (
            <span
              key={it.id}
              className="pm-catch-screen__icon"
              style={{
                left: `${16.66 + it.lane * 33.33}%`,
                top: `${y}%`,
              }}
            >
              {ICON_EMOJI[it.icon]}
            </span>
          )
        })}
        <div className="pm-catch-screen__zone" aria-hidden />
      </div>
      {interactive ? (
        <div className="pm-catch-screen__pads" role="group" aria-label={`${label} şeritleri`}>
          {([0, 1, 2] as LaneId[]).map((lane) => (
            <button
              key={lane}
              type="button"
              className={['pm-catch-screen__pad', side.lastCatchLane === lane ? 'is-flash' : '']
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              onClick={() => onCatch?.(lane)}
              aria-label={`Şerit ${lane + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function CatchDuelArena({ p1, p2, now, disabled = false, onCatch }: Props) {
  return (
    <div className="pm-catch-arena">
      <CatchScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        interactive
        disabled={disabled}
        onCatch={onCatch}
      />
      <CatchScreen side={p2} label="RAKİP" accent="pink" now={now} interactive={false} />
    </div>
  )
}
