import { motion } from 'framer-motion'

type XoxNeonMarkProps = {
  symbol: 'X' | 'O'
  className?: string
}

export function XoxNeonMark({ symbol, className = '' }: XoxNeonMarkProps) {
  if (symbol === 'X') {
    return (
      <motion.svg
        className={`pm-xox-mark pm-xox-mark--x ${className}`}
        viewBox="0 0 64 64"
        aria-hidden
        initial={{ opacity: 0, scale: 0.72, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
      >
        <defs>
          <filter id="pm-xox-x-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.line
          x1="14"
          y1="14"
          x2="50"
          y2="50"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#pm-xox-x-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />
        <motion.line
          x1="50"
          y1="14"
          x2="14"
          y2="50"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#pm-xox-x-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.28, delay: 0.06, ease: 'easeOut' }}
        />
      </motion.svg>
    )
  }

  return (
    <motion.svg
      className={`pm-xox-mark pm-xox-mark--o ${className}`}
      viewBox="0 0 64 64"
      aria-hidden
      initial={{ opacity: 0, scale: 0.72, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 520, damping: 26 }}
    >
      <defs>
        <filter id="pm-xox-o-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        filter="url(#pm-xox-o-glow)"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}
