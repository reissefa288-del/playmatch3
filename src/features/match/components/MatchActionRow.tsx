import type { ReactNode } from 'react'
import { FiHeart, FiStar, FiX } from 'react-icons/fi'
import { LuGamepad2, LuRotateCcw } from 'react-icons/lu'
import { motion } from 'framer-motion'

export function MatchActionRow() {
  return (
    <motion.div
      className="pm-match-actions"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45 }}
    >
      <ActionCircle
        label="Geri Al"
        variant="muted"
        badge={1}
        icon={<LuRotateCcw className="text-xl text-[#c4c0e4]" />}
      />
      <ActionCircle label="Geç" variant="pass" icon={<FiX className="text-2xl text-[#e8d8ff]" />} />
      <ActionCircle
        label="Eşleşme isteği gönder"
        variant="match"
        large
        icon={<FiHeart className="text-[2rem] text-[#ff3db8]" />}
      />
      <ActionCircle
        label="Oyuna davet et"
        variant="invite"
        icon={<LuGamepad2 className="text-2xl text-[#7ed4ff]" />}
      />
      <ActionCircle
        label="Süper beğeni"
        variant="muted"
        badge={1}
        icon={<FiStar className="text-xl text-[#ddd0ff]" />}
      />
    </motion.div>
  )
}

type ActionCircleProps = {
  label: string
  icon: ReactNode
  variant: 'muted' | 'pass' | 'match' | 'invite'
  badge?: number
  large?: boolean
}

function ActionCircle({ label, icon, variant, badge, large }: ActionCircleProps) {
  const isLarge = large || variant === 'match'
  const variantClass =
    variant === 'pass'
      ? 'pm-match-action--pass'
      : variant === 'invite'
        ? 'pm-match-action--invite'
        : variant === 'muted'
          ? 'pm-match-action--muted'
          : ''

  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`pm-match-action ${isLarge ? 'pm-match-action--lg' : 'pm-match-action--sm'} ${variantClass}`}
      whileHover={{ scale: large ? 1.06 : 1.05, y: -2 }}
      whileTap={{ scale: 0.92 }}
    >
      {badge != null ? <span className="pm-match-action__badge">{badge}</span> : null}
      {icon}
    </motion.button>
  )
}
