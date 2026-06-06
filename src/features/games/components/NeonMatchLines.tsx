import type { MatchSegment } from '../utils/neonCrushEngine'
import { colOf, COLS, rowOf, ROWS } from '../utils/neonCrushEngine'

type NeonMatchLinesProps = {
  segments: MatchSegment[]
  swap?: [number, number]
  accent: 'cyan' | 'pink'
}

function cellCenter(col: number, row: number) {
  const x = col * (100 / COLS) + 100 / COLS / 2
  const y = row * (100 / ROWS) + 100 / ROWS / 2
  return { x, y }
}

export function NeonMatchLines({ segments, swap, accent }: NeonMatchLinesProps) {
  return (
    <svg className={`pm-ncrush-match-lines is-${accent}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {segments.map((seg, i) => {
        const cols = seg.indices.map(colOf)
        const rows = seg.indices.map(rowOf)
        const minC = Math.min(...cols)
        const maxC = Math.max(...cols)
        const minR = Math.min(...rows)
        const maxR = Math.max(...rows)
        const cellW = 100 / COLS
        const cellH = 100 / ROWS
        const pad = 0.35

        const tierClass =
          seg.tier === 5 ? 'is-tier-5' : seg.tier === 4 ? 'is-tier-4' : 'is-tier-3'

        if (seg.orientation === 'h') {
          const y = minR * cellH + cellH / 2
          const x = minC * cellW + pad
          const w = (maxC - minC + 1) * cellW - pad * 2
          return (
            <line
              key={`h-${i}-${seg.indices.join('-')}`}
              className={`pm-ncrush-match-lines__stroke ${tierClass}`}
              x1={x}
              y1={y}
              x2={x + w}
              y2={y}
            />
          )
        }

        const x = minC * cellW + cellW / 2
        const y = minR * cellH + pad
        const h = (maxR - minR + 1) * cellH - pad * 2
        return (
          <line
            key={`v-${i}-${seg.indices.join('-')}`}
            className={`pm-ncrush-match-lines__stroke ${tierClass}`}
            x1={x}
            y1={y}
            x2={x}
            y2={y + h}
          />
        )
      })}

      {swap ? (
        <>
          <line
            className="pm-ncrush-match-lines__swap"
            x1={cellCenter(colOf(swap[0]), rowOf(swap[0])).x}
            y1={cellCenter(colOf(swap[0]), rowOf(swap[0])).y}
            x2={cellCenter(colOf(swap[1]), rowOf(swap[1])).x}
            y2={cellCenter(colOf(swap[1]), rowOf(swap[1])).y}
          />
          <circle
            className="pm-ncrush-match-lines__swap-node"
            cx={cellCenter(colOf(swap[0]), rowOf(swap[0])).x}
            cy={cellCenter(colOf(swap[0]), rowOf(swap[0])).y}
            r={1.8}
          />
          <circle
            className="pm-ncrush-match-lines__swap-node"
            cx={cellCenter(colOf(swap[1]), rowOf(swap[1])).x}
            cy={cellCenter(colOf(swap[1]), rowOf(swap[1])).y}
            r={1.8}
          />
        </>
      ) : null}
    </svg>
  )
}
