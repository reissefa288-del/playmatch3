import { FiSliders } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function MatchTitleBar() {
  return (
    <motion.header
      className="pm-match-head flex items-start justify-between gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="min-w-0 flex-1"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <h1>Eşleşme</h1>
        <p>Yeni insanlarla tanış, oyun arkadaşı bul! ✨</p>
      </motion.div>
      <motion.button
        type="button"
        className="pm-match-filter-btn shrink-0"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Filtrele"
      >
        <FiSliders />
        <span>Filtrele</span>
      </motion.button>
    </motion.header>
  )
}
