import { AnimatePresence, motion } from 'framer-motion'
import { FiHeart, FiStar } from 'react-icons/fi'
import { LuGamepad2 } from 'react-icons/lu'
import type { MatchToastPayload } from '../useMatchDiscover'

type MatchToastProps = {
  toast: MatchToastPayload | null
  onDismiss: () => void
}

const icons = {
  premium: FiStar,
  invite: LuGamepad2,
  warn: FiHeart,
  success: FiHeart,
} as const

export function MatchToast({ toast, onDismiss }: MatchToastProps) {
  return (
    <div className="pm-match-toast-host" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            className={`pm-match-toast pm-match-toast--${toast.variant}`}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <div className="pm-match-toast__glow" aria-hidden />
            <motion.span
              className="pm-match-toast__icon"
              aria-hidden
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              {(() => {
                const Icon = icons[toast.variant]
                return <Icon />
              })()}
            </motion.span>
            <motion.div
              className="pm-match-toast__body"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06, duration: 0.28 }}
            >
              <p className="pm-match-toast__title">{toast.title}</p>
              {toast.subtitle ? (
                <p className="pm-match-toast__subtitle">{toast.subtitle}</p>
              ) : null}
            </motion.div>
            <button
              type="button"
              className="pm-match-toast__dismiss"
              onClick={onDismiss}
              aria-label="Bildirimi kapat"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
