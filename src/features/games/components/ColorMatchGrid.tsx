import type { ColorId, ColorLaneState } from '../utils/colorMatchEngine'

type Props = {
  lane: ColorLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onTap?: (index: number) => void
}

export function ColorMatchGrid({ lane, accent, interactive = false, onTap }: Props) {
  return (
    <div
      className={[
        `pm-cmatch-grid is-${accent}`,
        lane.lastFx === 'miss' && interactive ? 'has-shake' : '',
        lane.lastFx === 'hit' && interactive ? 'has-pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pm-cmatch-grid__cells" role="grid" aria-label="Renk ızgarası">
        {lane.cells.map((cell, index) => (
          <button
            key={index}
            type="button"
            role="gridcell"
            className={['pm-cmatch-cell', `is-${cell.color}`].join(' ')}
            disabled={!interactive}
            onClick={() => onTap?.(index)}
            aria-label={`Renk ${cell.color}`}
          />
        ))}
      </div>
    </div>
  )
}

export function ColorTargetSwatch({ color }: { color: ColorId }) {
  return (
    <div className="pm-cmatch-target">
      <span className="pm-cmatch-target__label">HEDEF RENK</span>
      <div className={`pm-cmatch-target__swatch is-${color}`} />
    </div>
  )
}
