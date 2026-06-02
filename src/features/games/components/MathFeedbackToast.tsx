import { motion } from 'framer-motion'
import { FiCheck, FiShield, FiX } from 'react-icons/fi'
import type { MathFeedbackToast as Toast } from '../utils/mathDuelEngine'

type MathFeedbackToastProps = {
  toast: Toast
  accent: 'cyan' | 'pink'
}

function formatPoints(n: number) {
  return Math.abs(n).toLocaleString('tr-TR')
}

export function MathFeedbackToast({ toast, accent }: MathFeedbackToastProps) {
  const isCorrect = toast.variant === 'correct'
  const isShield = toast.variant === 'shield'

  const title = isCorrect ? 'Doğru cevap' : isShield ? 'Kalkan aktif' : 'Yanlış cevap'
  const detail = isCorrect
    ? `+${formatPoints(toast.points)} puan`
    : isShield
      ? 'Can kaybı yok'
      : `−${formatPoints(toast.points)} puan`

  return (
    <motion.div
      className={`pm-math-toast is-${toast.variant} is-${accent}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <span className="pm-math-toast__icon" aria-hidden>
        {isCorrect ? <FiCheck /> : isShield ? <FiShield /> : <FiX />}
      </span>
      <span className="pm-math-toast__copy">
        <strong className="pm-math-toast__title">{title}</strong>
        <span className="pm-math-toast__detail">{detail}</span>
      </span>
    </motion.div>
  )
}
