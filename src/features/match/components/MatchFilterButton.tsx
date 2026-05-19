import { FiSliders } from 'react-icons/fi'
import { motion } from 'framer-motion'

type MatchFilterButtonProps = {
  onClick: () => void
}

export function MatchFilterButton({ onClick }: MatchFilterButtonProps) {
  return (
    <motion.button
      type="button"
      className="pm-match-filter-btn pm-match-filter-btn--top"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Filtrele"
      onClick={onClick}
    >
      <FiSliders />
      <span>Filtrele</span>
    </motion.button>
  )
}
