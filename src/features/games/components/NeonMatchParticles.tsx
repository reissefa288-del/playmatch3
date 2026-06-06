import { motion } from 'framer-motion'
import { colOf, rowOf, type MatchSegment } from '../utils/neonCrushEngine'

type Props = {
  segments: MatchSegment[]
  accent: 'cyan' | 'pink'
  tick: number
}

export function NeonMatchParticles({ segments, accent, tick }: Props) {
  const points = segments.flatMap((seg) => {
    const cols = seg.indices.map(colOf)
    const rows = seg.indices.map(rowOf)
    const cx = (Math.min(...cols) + Math.max(...cols)) / 2
    const cy = (Math.min(...rows) + Math.max(...rows)) / 2
    const count = seg.tier >= 5 ? 5 : seg.tier === 4 ? 4 : 3
    return Array.from({ length: count }, (_, i) => ({
      col: cx + (i - count / 2) * 0.15,
      row: cy,
      tier: seg.tier,
      key: `${seg.indices.join('-')}-${i}`,
    }))
  })

  if (points.length === 0) return null

  return (
    <div className="pm-ncrush-match-particles" aria-hidden>
      {points.map((p) => (
        <motion.i
          key={`${tick}-${p.key}`}
          className={[
            'pm-ncrush-match-particles__dot',
            `is-${accent}`,
            p.tier >= 5 ? 'is-tier-5' : p.tier === 4 ? 'is-tier-4' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            gridColumn: p.col + 1,
            gridRow: p.row + 1,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0.2], y: [0, -18, -36] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
