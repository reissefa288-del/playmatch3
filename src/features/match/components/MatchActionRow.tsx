import { useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import actionUndo from '../assets/action-undo.png'
import actionPass from '../assets/action-pass.png'
import actionLike from '../assets/action-like.png'
import actionInvite from '../assets/action-invite.png'
import actionSuper from '../assets/action-super.png'
import { usePremiumSubscriptionState } from '../../premium/usePremiumSubscription'
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
  const navigate = useNavigate()
  const { active: isPremium } = usePremiumSubscriptionState()
  const [burst, setBurst] = useState(false)

  const handleUndo = () => {
    if (!isPremium) {
      navigate('/premium', { state: { notice: 'Geri almak için Premium almalısın.' } })
      return
    }
    if (canUndo) onUndo()
  }

  const handleLike = () => {
    if (!canAct || !canLike) return
    setBurst(true)
    window.setTimeout(() => setBurst(false), 700)
    onLike()
  }

  return (
    <div
      className="pm-match-actions-block"
     
     
     
    >
      <MatchLikesQuota remaining={likesRemaining} limit={dailyLimit} isUnlimited={isUnlimited} />
      <div className="pm-match-actions">
      <ActionCircle
        label={isPremium ? 'Geri al' : 'Geri almak için Premium al'}
        variant="muted"
        icon={<img src={actionUndo} alt="" />}
        onClick={handleUndo}
        disabled={isPremium ? !canUndo : false}
      />
      <ActionCircle
        label="Geç"
        variant="pass"
        icon={<img src={actionPass} alt="" />}
        onClick={onPass}
        disabled={!canAct}
      />
      <div className={`pm-match-action-like-slot${burst ? ' is-burst' : ''}`}>
        <ActionCircle
          label={
            canLike
              ? `Eşleşme isteği gönder (${likesRemaining}/${dailyLimit})`
              : 'Beğeni hakkın bitti'
          }
          variant="match"
          large
          icon={<img src={actionLike} alt="" />}
          onClick={handleLike}
          disabled={!canAct || !canLike}
        />
        {burst ? (
          <span className="pm-like-burst" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
        ) : null}
      </div>
      <ActionCircle
        label="Oyuna davet et"
        variant="invite"
        icon={<img src={actionInvite} alt="" />}
        onClick={onInvite}
        disabled={!canAct}
      />
      <ActionCircle
        label="Süper beğeni"
        variant="super"
        icon={<img src={actionSuper} alt="" />}
        onClick={onSuperLike}
        disabled={!canAct}
      />
      </div>
    </div>
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
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={`pm-match-action ${isLarge ? 'pm-match-action--lg' : 'pm-match-action--sm'} ${variantClass}${disabled ? ' is-disabled' : ''}`}
     
     
     
    >
      <span className="pm-match-action__icon" aria-hidden>
        {icon}
      </span>
    </button>
  )
}
