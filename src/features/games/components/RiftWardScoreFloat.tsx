import { AnimatePresence, motion } from 'framer-motion'
import type { RwScoreFloat } from '../utils/riftWardFx'

type Props = {
  floats: RwScoreFloat[]
  now: number
}

function formatAmount(n: number) {
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${n.toLocaleString('tr-TR')}`
}

export function RiftWardScoreFloat({ floats, now }: Props) {
  const active = floats.filter((f) => now - f.bornAt < 900)

  return (
    <div className="pm-rw-score-float-layer" aria-live="polite">
      <AnimatePresence>
        {active.map((f) => {
          const age = now - f.bornAt
          const sideClass = f.side === 'p1' ? 'is-p1' : 'is-p2'
          const kindClass = f.amount > 0 ? 'is-gain' : 'is-loss'
          return (
            <motion.span
              key={f.id}
              className={['pm-rw-score-float', sideClass, kindClass].join(' ')}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1 - age / 900, y: -18 - age * 0.02, scale: 1 }}
              exit={{ opacity: 0, y: -32, scale: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              {formatAmount(f.amount)}
            </motion.span>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
