import { useState, type MouseEvent } from 'react'
import { IoHeart } from 'react-icons/io5'
import { motion, useReducedMotion } from 'framer-motion'
import { useNearbyLikesActions, useHasLiked } from '../NearbyLikesProvider'

export type NearbyLikePhase = 'idle' | 'burst' | 'exit'

const BURST_MS = 900

type NearbyLikeButtonProps = {
  playerId: string
  playerName: string
  variant?: 'card' | 'list'
  /** Ana sayfa kartı: beğenince listeden çıkar. Tam liste: kart kalır. */
  dismissAfterLike?: boolean
  onPhaseChange?: (phase: NearbyLikePhase) => void
  className?: string
}

export function NearbyLikeButton({
  playerId,
  playerName,
  variant = 'card',
  dismissAfterLike = variant === 'card',
  onPhaseChange,
  className = '',
}: NearbyLikeButtonProps) {
  const reduceMotion = useReducedMotion()
  const { sendLike } = useNearbyLikesActions()
  const alreadyLiked = useHasLiked(playerId)
  const [phase, setPhase] = useState<NearbyLikePhase>('idle')

  const setLikePhase = (next: NearbyLikePhase) => {
    setPhase(next)
    onPhaseChange?.(next)
  }

  const handleLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (phase !== 'idle') return
    if (!alreadyLiked) sendLike(playerId)
    setLikePhase('burst')
    window.setTimeout(() => {
      setLikePhase(dismissAfterLike ? 'exit' : 'idle')
    }, BURST_MS)
  }

  const busy = phase !== 'idle'
  const showLikedStyle = alreadyLiked || busy

  return (
    <div className={`pm-nearby-card__like-wrap ${className}`.trim()}>
      <motion.button
        type="button"
        className={`pm-nearby-card__like-btn${showLikedStyle ? ' is-liked' : ''}${variant === 'list' ? ' pm-nearby-list-card__like-btn' : ''}`}
        aria-label={alreadyLiked ? `${playerName} beğenildi` : `${playerName} beğen`}
        disabled={busy}
        onClick={handleLike}
        whileTap={reduceMotion || busy ? undefined : { scale: 0.88 }}
        animate={
          phase === 'burst' && !reduceMotion
            ? { scale: [1, 1.28, 1.05] }
            : { scale: 1 }
        }
        transition={{ duration: 0.38 }}
      >
        <IoHeart className="pm-nearby-card__like-btn-icon" aria-hidden />
      </motion.button>
    </div>
  )
}
