import { motion } from 'framer-motion'

type XoxPlacementFxProps = {
  index: number
  symbol: 'X' | 'O'
}

export function XoxPlacementFx({ index, symbol }: XoxPlacementFxProps) {
  const col = index % 3
  const row = Math.floor(index / 3)
  const left = `${(col + 0.5) * (100 / 3)}%`
  const top = `${(row + 0.5) * (100 / 3)}%`
  const isX = symbol === 'X'

  return (
    <motion.div
      className={`pm-xox-placement-fx is-${symbol.toLowerCase()}`}
      style={{ left, top }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      aria-hidden
    >
      <motion.span
        className="pm-xox-placement-fx__ring"
        initial={{ scale: 0.2, opacity: 0.85 }}
        animate={{ scale: 1.65, opacity: 0 }}
        transition={{ duration: 0.48, ease: 'easeOut' }}
      />
      <motion.span
        className="pm-xox-placement-fx__ring pm-xox-placement-fx__ring--inner"
        initial={{ scale: 0.35, opacity: 0.7 }}
        animate={{ scale: 1.15, opacity: 0 }}
        transition={{ duration: 0.34, ease: 'easeOut' }}
      />
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const dist = isX ? 22 : 18
        return (
          <motion.span
            key={i}
            className="pm-xox-placement-fx__spark"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
              scale: 0.2,
            }}
            transition={{ duration: 0.42, ease: 'easeOut', delay: i * 0.015 }}
          />
        )
      })}
    </motion.div>
  )
}
