import { motion } from 'framer-motion'

type MemoryMatchFxProps = {
  accent: 'cyan' | 'pink'
}

export function MemoryMatchFx({ accent }: MemoryMatchFxProps) {
  return (
    <motion.span
      className={`pm-memory-match-fx is-${accent}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0.8, 0], scale: [0.8, 1.35] }}
      transition={{ duration: 0.45 }}
      aria-hidden
    />
  )
}
