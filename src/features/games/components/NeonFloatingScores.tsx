import { colOf, rowOf } from '../utils/neonCrushEngine'

type Props = {
  indices: number[]
  total: number
  accent: 'cyan' | 'pink'
  tier?: 4 | 5 | null
  tick: number
}

export function NeonFloatingScores({ indices, total, accent, tier, tick }: Props) {
  if (indices.length === 0 || total <= 0) return null

  const shown = indices.slice(0, 6)
  const each = Math.max(1, Math.round(total / shown.length))

  return (
    <div className="pm-ncrush-float-scores" aria-hidden>
      {shown.map((cellIndex) => (
        <span
          key={`${tick}-${cellIndex}`}
          className={[
            'pm-ncrush-float-score',
            'pm-score-pop-enter',
            `is-${accent}`,
            tier === 5 ? 'is-tier-5' : tier === 4 ? 'is-tier-4' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            gridColumn: colOf(cellIndex) + 1,
            gridRow: rowOf(cellIndex) + 1,
          }}
        >
          +{each}
        </span>
      ))}
    </div>
  )
}
