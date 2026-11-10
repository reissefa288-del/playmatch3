import { useState, type CSSProperties, type ReactNode } from 'react'
import actionUndo from '../assets/action-undo.png'
import actionPass from '../assets/action-pass.png'
import actionLike from '../assets/action-like.png'
import actionInvite from '../assets/action-invite.png'
import actionSuper from '../assets/action-super.png'
import { DAILY_LIKES_LIMIT } from '../data'
import { ActionRimShader, type ActionRimTone } from './ActionRimShader'

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
}: MatchActionRowProps) {
  const [burst, setBurst] = useState(false)

  const handleUndo = () => {
    if (canUndo) onUndo()
  }

  const handleLike = () => {
    if (!canAct || !canLike) return
    setBurst(true)
    window.setTimeout(() => setBurst(false), 700)
    onLike()
  }

  return (
    <div className="pm-match-actions-block">
      <div className="pm-match-actions pm-match-actions--glass">
        <ActionCircle
          label="Geri al"
          variant="muted"
          icon={<img src={actionUndo} alt="" width={512} height={512} draggable={false} />}
          onClick={handleUndo}
        />
        <ActionCircle
          label="Geç"
          variant="pass"
          icon={<img src={actionPass} alt="" width={512} height={512} draggable={false} />}
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
            icon={<img src={actionLike} alt="" width={512} height={512} draggable={false} />}
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
          icon={<img src={actionInvite} alt="" width={512} height={512} draggable={false} />}
          onClick={onInvite}
          disabled={!canAct}
        />
        <ActionCircle
          label="Süper beğeni"
          variant="super"
          icon={<img src={actionSuper} alt="" width={512} height={512} draggable={false} />}
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
  const tone = variant as ActionRimTone
  const variantClass =
    variant === 'pass'
      ? 'pm-match-action--pass'
      : variant === 'invite'
        ? 'pm-match-action--invite'
        : variant === 'super'
          ? 'pm-match-action--super'
          : variant === 'muted'
            ? 'pm-match-action--muted'
            : variant === 'match'
              ? 'pm-match-action--match'
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
      <ActionRimShader tone={tone} large={isLarge} />
      <span className="pm-match-action__icon" aria-hidden>
        {icon}
      </span>
    </button>
  )
}
