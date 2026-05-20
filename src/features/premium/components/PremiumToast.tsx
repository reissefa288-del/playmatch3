import { AnimatePresence, motion } from 'framer-motion'
import { FiGift, FiStar } from 'react-icons/fi'
import type { PremiumToastPayload } from '../usePremiumScreen'

type PremiumToastProps = {
  toast: PremiumToastPayload | null
  onDismiss: () => void
}

export function PremiumToast({ toast, onDismiss }: PremiumToastProps) {
  return (
    <motion.div
      className="pm-premium-toast-host"
      aria-live="polite"
      initial={false}
    >
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            className="pm-match-toast pm-match-toast--premium pm-premium-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <motion.div className="pm-match-toast__glow" aria-hidden />
            <motion.span
              className="pm-match-toast__icon"
              aria-hidden
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              {toast.variant === 'success' ? <FiGift /> : <FiStar />}
            </motion.span>
            <div className="pm-match-toast__body">
              <p className="pm-match-toast__title">{toast.title}</p>
              {toast.subtitle ? (
                <p className="pm-match-toast__subtitle">{toast.subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="pm-match-toast__dismiss"
              onClick={onDismiss}
              aria-label="Bildirimi kapat"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
