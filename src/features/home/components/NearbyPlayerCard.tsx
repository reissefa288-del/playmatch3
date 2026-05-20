import { useState } from 'react'
import { FiCheck, FiHeart } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { MdEmojiEvents } from 'react-icons/md'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { NearbyPlayer } from '../types'
import { useNearbyLikes } from '../useNearbyLikes'

type NearbyPlayerCardProps = {
  player: NearbyPlayer
  onDismissed?: () => void
}

type LikePhase = 'idle' | 'burst' | 'exit'

const BURST_MS = 720

export function NearbyPlayerCard({ player, onDismissed }: NearbyPlayerCardProps) {
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
      className="pm-nearby-card pm-nearby-card--aaa"
      layout
      initial={false}
      animate={
        phase === 'exit' && !reduceMotion
          ? { opacity: 0, x: 140, scale: 0.88, rotate: 6 }
          : { opacity: 1, x: 0, scale: 1, rotate: 0 }
      }
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      onAnimationComplete={handleExitComplete}
    >
      <span className="pm-nearby-card__glow" aria-hidden />
      <span className="pm-nearby-card__shine" aria-hidden />

      <AnimatePresence>
        {phase === 'burst' ? (
          <motion.div
            className="pm-nearby-card__like-burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
        className="pm-nearby-card__image"
        style={{
          backgroundImage: `url(${fakePortraitForProfile(player.id, player.gender)})`,
          backgroundPosition: player.portraitPosition,
        }}
      >
        <div className="pm-nearby-card__meta">
          {player.isOnline ? <span className="pm-status-pill is-small">Online</span> : <span />}
          <span className="pm-distance-pill">{player.distance}</span>
        </div>
      </div>

      <div className="pm-nearby-card__body">
        <h4>
          {player.name}
          {player.verified ? <IoShieldCheckmark aria-hidden /> : null}
          <span>{player.age}</span>
        </h4>
        <p>
          <MdEmojiEvents aria-hidden /> {player.rank}
        </p>
        {player.recentActivity ? <p className="pm-nearby-card__live">{player.recentActivity}</p> : null}
      </div>

      <div className="pm-nearby-card__footer">
        <div className="pm-nearby-card__tags">
          {player.gameTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <button
          type="button"
          className={`pm-nearby-card__like-btn${alreadyLiked || phase !== 'idle' ? ' is-liked' : ''}`}
          aria-label={alreadyLiked ? 'Beğenildi' : `${player.name} beğen`}
          disabled={phase !== 'idle' || alreadyLiked}
          onClick={handleLike}
        >
          <FiHeart aria-hidden />
        </button>
      </div>
    </motion.article>
  )
}
