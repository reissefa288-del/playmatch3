import { motion } from 'framer-motion'

export function MatchTitleBar() {
  return (
    <motion.header
      className="pm-match-head"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <h1>Eşleşme</h1>
        <p>Yeni insanlarla tanış, oyun arkadaşı bul! ✨</p>
      </motion.div>
    </motion.header>
  )
}
