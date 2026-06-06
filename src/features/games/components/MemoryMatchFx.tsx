import { motion } from 'framer-motion'

type MemoryMatchFxProps = {
  accent: 'cyan' | 'pink'
}

export function MemoryMatchFx({ accent }: MemoryMatchFxProps) {
  return (
    <motion.span
      className={`pm-memory-match-fx is-${accent}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <span className="pm-memory-match-fx__ring" />
      <span className="pm-memory-match-fx__burst" />
      {Array.from({ length: 6 }, (_, i) => (
        <i key={i} className="pm-memory-match-fx__spark" style={{ ['--spark-i' as string]: i }} />
      ))}
    </motion.span>
  )
}
