import { motion } from 'framer-motion'

type MemoryMatchFxProps = {
  accent: 'cyan' | 'pink'
}

export function MemoryMatchFx({ accent }: MemoryMatchFxProps) {
  return (
    <motion.span
      className={`pm-memory-match-fx is-${accent}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden
    >
      <span className="pm-memory-match-fx__ring" />
      <span className="pm-memory-match-fx__burst" />
      {Array.from({ length: 4 }, (_, i) => (
        <i key={i} className="pm-memory-match-fx__spark" style={{ ['--spark-i' as string]: i }} />
      ))}
    </motion.span>
  )
}
