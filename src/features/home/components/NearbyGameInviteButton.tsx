import { useState, type MouseEvent } from 'react'
import { FiLock } from 'react-icons/fi'
import { IoGameController } from 'react-icons/io5'
import { motion, useReducedMotion } from 'framer-motion'
import { usePremiumSubscription } from '../../premium/usePremiumSubscription'
import { useNearbyLikes } from '../useNearbyLikes'

export type NearbyInvitePhase = 'idle' | 'burst'

const BURST_MS = 900

type NearbyGameInviteButtonProps = {
  playerId: string
  playerName: string
  onPhaseChange?: (phase: NearbyInvitePhase) => void
  className?: string
}

export function NearbyGameInviteButton({
  playerId,
  playerName,
  onPhaseChange,
  className = '',
}: NearbyGameInviteButtonProps) {
  const reduceMotion = useReducedMotion()
  const { isPremiumActive } = usePremiumSubscription()
  const { hasInvited, sendInvite } = useNearbyLikes()
  const invited = hasInvited(playerId)
  const [phase, setPhase] = useState<NearbyInvitePhase>('idle')
  const [lockedHint, setLockedHint] = useState(false)

  const setInvitePhase = (next: NearbyInvitePhase) => {
    setPhase(next)
    onPhaseChange?.(next)
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (phase !== 'idle') return
    if (!isPremiumActive) {
      setLockedHint(true)
      window.setTimeout(() => setLockedHint(false), 2800)
      return
    }
    if (!invited) sendInvite(playerId)
    setInvitePhase('burst')
    window.setTimeout(() => setInvitePhase('idle'), BURST_MS)
  }

  const busy = phase !== 'idle'
  const label = invited
    ? `${playerName} oyuna davet edildi`
    : isPremiumActive
      ? `${playerName} oyuna davet et`
      : 'Oyuna davet için Premium gerekir'

  return (
    <motion.button
      type="button"
      className={`pm-nearby-card__invite-btn${isPremiumActive ? '' : ' is-locked'}${invited ? ' is-invited' : ''}${lockedHint ? ' is-locked-hint' : ''} ${className}`.trim()}
      aria-label={label}
      aria-pressed={invited}
      title={!isPremiumActive ? 'Premium ile oyuna davet gönder' : undefined}
      disabled={busy}
      onClick={handleClick}
      whileTap={reduceMotion || busy ? undefined : { scale: 0.88 }}
    >
      <IoGameController className="pm-nearby-card__invite-btn-icon" aria-hidden />
      {!isPremiumActive && !invited ? (
        <FiLock className="pm-nearby-card__invite-btn-lock" aria-hidden />
      ) : null}
    </motion.button>
  )
}
