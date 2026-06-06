import { motion } from 'framer-motion'

type Props = {
  combo: number
  variant: 'p1' | 'p2'
}

export function SimonDuelComboBadge({ combo, variant }: Props) {
  if (combo < 2) return null

  const hot = combo >= 4
  const mega = combo >= 6

  return (
    <motion.div
      key={combo}
      className={[
        'pm-simon-combo',
        `is-${variant}`,
        hot ? 'is-hot' : '',
        mega ? 'is-mega' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      initial={{ scale: 0.7, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 560, damping: 20 }}
      aria-label={`Combo ${combo}`}
    >
      <span className="pm-simon-combo__label">COMBO</span>
      <strong className="pm-simon-combo__mult">×{combo}</strong>
    </motion.div>
  )
}
