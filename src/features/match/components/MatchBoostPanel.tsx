import { FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'

export function MatchBoostPanel() {
  return (
    <motion.section
      className="relative overflow-hidden rounded-[1.25rem] border border-[rgba(255,130,210,0.42)] bg-[linear-gradient(115deg,rgba(255,70,160,0.18),rgba(60,100,220,0.14),rgba(18,8,42,0.78))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.38),0_0_48px_rgba(255,80,170,0.16)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      aria-label="Boost"
    >
      <motion.div
        className="pm-match-boost-shimmer pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex items-center gap-4">
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(255,190,230,0.5)] bg-[linear-gradient(145deg,rgba(255,95,190,0.55),rgba(120,40,120,0.45))] shadow-[0_0_32px_rgba(255,80,170,0.5)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FiZap className="text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" aria-hidden />
        </motion.div>
        <p className="min-w-0 flex-1 text-[0.875rem] leading-[1.45] text-[#ececff]">
          <span className="font-bold text-white">Eşleşme şansını artır!</span>{' '}
          Daha fazla kişi seni görsün.
        </p>
        <motion.button
          type="button"
          className="shrink-0 rounded-xl border border-[rgba(255,150,210,0.6)] bg-[linear-gradient(180deg,rgba(255,130,210,0.42),rgba(170,40,120,0.6))] px-4 py-2.5 text-[0.75rem] font-bold uppercase tracking-wide text-white shadow-[0_0_28px_rgba(255,90,170,0.45),inset_0_1px_0_rgba(255,255,255,0.22)]"
          whileHover={{ scale: 1.05, filter: 'brightness(1.12)' }}
          whileTap={{ scale: 0.94 }}
        >
          Boost Et
        </motion.button>
      </div>
    </motion.section>
  )
}
