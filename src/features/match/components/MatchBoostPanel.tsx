import { FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function MatchBoostPanel() {
  return (
    <motion.section
      className="pm-match-boost"
      aria-label="Boost"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.45 }}
    >
      <div className="pm-match-boost-shimmer" aria-hidden />
      <motion.div className="pm-match-boost__inner">
        <div className="pm-match-boost__icon">
          <FiZap aria-hidden />
        </div>
        <p className="pm-match-boost__text">
          <strong>Eşleşme Şansını Artır!</strong>
          Daha fazla kişi seni görsün.
        </p>
        <motion.button
          type="button"
          className="pm-match-boost__cta"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          Boost Et
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
