import { MAX_LIVES } from '../utils/sliceDuelEngine'

type Props = {
  lives: number
  variant: 'p1' | 'p2'
  compact?: boolean
}

export function SliceDuelHealth({ lives, variant, compact = false }: Props) {
  return (
    <div
      className={['pm-slice-health', `is-${variant}`, compact ? 'is-compact' : ''].filter(Boolean).join(' ')}
      aria-label={`Can ${lives}/${MAX_LIVES}`}
    >
      {Array.from({ length: MAX_LIVES }, (_, i) => {
        const filled = i < lives
        const critical = lives <= 2 && filled
        return (
          <span
            key={i}
            className={['pm-slice-health__pip', filled ? 'is-on' : 'is-off', critical ? 'is-critical' : '']
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          />
        )
      })}
    </div>
  )
}
