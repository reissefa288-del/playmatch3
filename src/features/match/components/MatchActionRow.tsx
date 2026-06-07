import type { ReactNode } from 'react'
import { FiHeart, FiStar, FiX } from 'react-icons/fi'
import { LuGamepad2, LuRotateCcw } from 'react-icons/lu'
import { motion } from 'framer-motion'
import { DAILY_LIKES_LIMIT } from '../data'
import { MatchLikesQuota } from './MatchLikesQuota'

type MatchActionRowProps = {
  onUndo: () => void
  onPass: () => void
  onLike: () => void
  onInvite: () => void
  onSuperLike: () => void
  canUndo: boolean
  canLike: boolean
  canAct: boolean
  likesRemaining: number
  dailyLimit?: number
  isUnlimited?: boolean
}

export function MatchActionRow({
  onUndo,
  onPass,
  onLike,
  onInvite,
  onSuperLike,
  canUndo,
  canLike,
  canAct,
  likesRemaining,
  dailyLimit = DAILY_LIKES_LIMIT,
  isUnlimited = false,
}: MatchActionRowProps) {
  return (
    <motion.div
      className="pm-match-actions-block"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45 }}
    >
      <MatchLikesQuota remaining={likesRemaining} limit={dailyLimit} isUnlimited={isUnlimited} />
      <motion.div className="pm-match-actions">
      <ActionCircle
        label="Geri Al"
        variant="muted"
        icon={<LuRotateCcw />}
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ActionCircle
        label="Geç"
        variant="pass"
        icon={<FiX />}
        onClick={onPass}
        disabled={!canAct}
      />
      <div className="pm-match-action-like-slot">
        <ActionCircle
          label={
            canLike
              ? `Eşleşme isteği gönder (${likesRemaining}/${dailyLimit})`
              : 'Beğeni hakkın bitti'
          }
          variant="match"
          large
          icon={<FiHeart />}
          onClick={onLike}
          disabled={!canAct || !canLike}
        />
      </div>
      <ActionCircle
        label="Oyuna davet et"
        variant="invite"
        icon={<LuGamepad2 />}
        onClick={onInvite}
        disabled={!canAct}
      />
      <ActionCircle
        label="Süper beğeni"
        variant="super"
        icon={<FiStar />}
        onClick={onSuperLike}
        disabled={!canAct}
      />
      </motion.div>
    </motion.div>
  )
}

type ActionCircleProps = {
  label: string
  icon: ReactNode
  variant: 'muted' | 'pass' | 'match' | 'invite' | 'super'
  large?: boolean
  disabled?: boolean
  onClick: () => void
}

function ActionCircle({
  label,
  icon,
  variant,
  large,
  disabled,
  onClick,
}: ActionCircleProps) {
  const isLarge = large || variant === 'match'
  const variantClass =
    variant === 'pass'
      ? 'pm-match-action--pass'
      : variant === 'invite'
        ? 'pm-match-action--invite'
        : variant === 'super'
          ? 'pm-match-action--super'
          : variant === 'muted'
            ? 'pm-match-action--muted'
            : ''

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={`pm-match-action ${isLarge ? 'pm-match-action--lg' : 'pm-match-action--sm'} ${variantClass}${disabled ? ' is-disabled' : ''}`}
      whileHover={disabled ? undefined : { scale: large ? 1.07 : 1.055, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <span className="pm-match-action__icon" aria-hidden>
        {icon}
      </span>
    </motion.button>
  )
}
