import { useState } from 'react'
import { FiCheck, FiHeart, FiMapPin } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { NearbyPlayer } from '../types'
import { useNearbyLikes } from '../useNearbyLikes'

type NearbyPlayerListCardProps = {
  player: NearbyPlayer
  portraitImage: string
  index?: number
  onDismissed?: () => void
}

type LikePhase = 'idle' | 'burst' | 'exit'

const BURST_MS = 720

export function NearbyPlayerListCard({
  player,
  portraitImage,
  index = 0,
  onDismissed,
}: NearbyPlayerListCardProps) {
  const reduceMotion = useReducedMotion()
  const { hasLiked, sendLike } = useNearbyLikes()
  const alreadyLiked = hasLiked(player.id)
  const [phase, setPhase] = useState<LikePhase>('idle')

  const handleLike = () => {
    if (phase !== 'idle' || alreadyLiked) return
    sendLike(player.id)
    setPhase('burst')
    window.setTimeout(() => setPhase('exit'), BURST_MS)
  }

  const handleExitComplete = () => {
    if (phase === 'exit') onDismissed?.()
  }

  return (
    <motion.article
      className="pm-nearby-list-card pm-nearby-list-card--aaa"
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={
        phase === 'exit' && !reduceMotion
          ? { opacity: 0, x: 120, scale: 0.94 }
          : { opacity: 1, y: 0, x: 0, scale: 1 }
      }
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 30,
        delay: reduceMotion ? 0 : index * 0.04,
      }}
      onAnimationComplete={handleExitComplete}
    >
      <AnimatePresence>
        {phase === 'burst' ? (
          <motion.div
            className="pm-nearby-card__like-burst pm-nearby-card__like-burst--list"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            role="status"
          >
            <span className="pm-nearby-card__like-burst-ring" aria-hidden />
            <span className="pm-nearby-card__like-burst-icon" aria-hidden>
              <FiCheck />
            </span>
            <strong>Beğenildi!</strong>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className="pm-nearby-list-card__portrait"
        style={{
          backgroundImage: `url(${portraitImage})`,
          backgroundPosition: player.portraitPosition,
        }}
      >
        {player.isOnline ? <span className="pm-status-pill is-small">Online</span> : null}
      </div>

      <div className="pm-nearby-list-card__body">
        <h4>
          {player.name}
          {player.verified ? <IoShieldCheckmark aria-label="Doğrulanmış" /> : null}
          <span>{player.age}</span>
        </h4>
        <p>
          <FiMapPin aria-hidden /> {player.distance} · {player.rank}
        </p>
        {player.recentActivity ? (
          <p className="pm-nearby-list-card__live">{player.recentActivity}</p>
        ) : null}
        <div className="pm-nearby-list-card__tags">
          {player.gameTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`pm-nearby-card__like-btn pm-nearby-list-card__like-btn${
          alreadyLiked || phase !== 'idle' ? ' is-liked' : ''
        }`}
        aria-label={alreadyLiked ? 'Beğenildi' : `${player.name} beğen`}
        disabled={phase !== 'idle' || alreadyLiked}
        onClick={handleLike}
      >
        <FiHeart aria-hidden />
      </button>
    </motion.article>
  )
}
