import { motion, useReducedMotion } from 'framer-motion'
import { premiumGiftCta } from '../data'

type PremiumTitleBarProps = {
  onGift: () => void
}

export function PremiumTitleBar({ onGift }: PremiumTitleBarProps) {
  const reduceMotion = useReducedMotion()
  const GiftIcon = premiumGiftCta.icon

  return (
    <header className="pm-premium-title-bar">
      <motion.div
        className="pm-premium-title-bar__copy"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>Premium</h1>
        <p>Daha fazlasını keşfet, ayrıcalıkları yaşa! ✨</p>
      </motion.div>
      <motion.button
        type="button"
        className="pm-premium-gift-btn"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        onClick={onGift}
      >
        <GiftIcon aria-hidden />
        {premiumGiftCta.label}
      </motion.button>
    </header>
  )
}
