import { FiSliders } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function MatchTitleBar() {
  return (
    <motion.header
      className="flex flex-col gap-2 pb-0.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-start justify-between gap-4"
        whileHover={{ x: 0 }}
      >
        <motion.div
          className="min-w-0 flex-1"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <h1 className="text-[2.25rem] font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_0_32px_rgba(255,80,190,0.32)]">
            Eşleşme
          </h1>
          <p className="mt-2.5 max-w-[260px] text-[0.9375rem] leading-[1.5] text-[#c4cff5]">
            Rastgele keşfet — mesafe sınırı yok
          </p>
        </motion.div>
        <motion.button
          type="button"
          className="pm-match-filter-btn flex shrink-0 items-center gap-2.5 rounded-2xl border border-[rgba(132,164,255,0.4)] bg-[rgba(8,12,38,0.78)] px-4 py-3 text-[0.75rem] font-semibold text-[#e4ecff] shadow-[0_0_24px_rgba(88,132,255,0.2)] backdrop-blur-xl"
          whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.96 }}
          aria-label="Filtrele"
        >
          <FiSliders className="text-lg text-[#9cb6ff]" />
          <span>Filtrele</span>
        </motion.button>
      </motion.div>
    </motion.header>
  )
}
