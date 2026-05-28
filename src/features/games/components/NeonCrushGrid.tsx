import type { GemId, NeonLaneState } from '../utils/neonCrushEngine'

const GEM_LABEL: Record<GemId, string> = {
  heart: '♥',
  diamond: '◆',
  star: '★',
  club: '♣',
  flame: '🔥',
  moon: '☽',
}

type Props = {
  lane: NeonLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  selected?: number | null
  onTap?: (index: number) => void
}

export function NeonCrushGrid({ lane, accent, interactive = false, selected = null, onTap }: Props) {
  return (
    <div className={`pm-ncrush-board is-${accent}`}>
      <div className="pm-ncrush-board__cells" role="grid" aria-label="Neon tahta">
        {lane.cells.map((gem, index) => (
          <button
            key={index}
            type="button"
            role="gridcell"
            className={[
              'pm-ncrush-gem',
              `is-${gem}`,
              selected === index ? 'is-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={!interactive}
            onClick={() => onTap?.(index)}
            aria-label={gem}
          >
            <span aria-hidden>{GEM_LABEL[gem]}</span>
          </button>
        ))}
      </div>
      <div className={`pm-ncrush-board__footer is-${accent}`}>
        <span className="pm-ncrush-board__combo">COMBO x{lane.combo}</span>
        <div className="pm-ncrush-board__bar">
          <i style={{ width: `${Math.round(Math.min(1, lane.combo / 8) * 100)}%` }} />
        </div>
        <strong className="pm-ncrush-board__round">{lane.roundScore.toLocaleString('tr-TR')}</strong>
      </div>
    </div>
  )
}
