import { motion } from 'framer-motion'
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
      {shown.map((index, i) => (
        <motion.span
          key={`${tick}-${index}`}
          className={[
            'pm-ncrush-float-score',
            `is-${accent}`,
            tier === 5 ? 'is-tier-5' : tier === 4 ? 'is-tier-4' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            gridColumn: colOf(index) + 1,
            gridRow: rowOf(index) + 1,
          }}
          initial={{ opacity: 0, y: 4, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], y: -32, scale: [0.6, 1.15, 0.85] }}
          transition={{ duration: 0.55, delay: i * 0.045, ease: 'easeOut' }}
        >
          +{each}
        </motion.span>
      ))}
    </div>
  )
}
