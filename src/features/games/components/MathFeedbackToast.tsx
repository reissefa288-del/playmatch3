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
    <div
      className={`pm-math-toast pm-math-toast-enter is-${toast.variant} is-${accent}`}
      role="status"
      aria-live="polite"
    >
      <span className="pm-math-toast__icon" aria-hidden>
        {isCorrect ? <FiCheck /> : isShield ? <FiShield /> : <FiX />}
      </span>
      <span className="pm-math-toast__copy">
        <strong className="pm-math-toast__title">{title}</strong>
        <span className="pm-math-toast__detail">{detail}</span>
      </span>
    </div>
  )
}
