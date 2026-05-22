import { useEffect, useState } from 'react'
import { IoShieldCheckmark } from 'react-icons/io5'
import { MdEmojiEvents } from 'react-icons/md'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { NearbyPlayer } from '../types'
import { NearbyLikeBurst } from './NearbyLikeBurst'
import { NearbyLikeButton, type NearbyLikePhase } from './NearbyLikeButton'

type NearbyPlayerCardProps = {
  player: NearbyPlayer
  onDismissed?: () => void
}

export function NearbyPlayerCard({ player, onDismissed }: NearbyPlayerCardProps) {
  const reduceMotion = useReducedMotion()
  const [likePhase, setLikePhase] = useState<NearbyLikePhase>('idle')

  useEffect(() => {
    if (likePhase !== 'exit') return
    const ms = reduceMotion ? 0 : 420
    const id = window.setTimeout(() => onDismissed?.(), ms)
    return () => window.clearTimeout(id)
  }, [likePhase, reduceMotion, onDismissed])

  return (
    <motion.article
      className="pm-nearby-card pm-nearby-card--aaa"
      layout
      initial={false}
      animate={
        likePhase === 'exit' && !reduceMotion
          ? { opacity: 0, x: 140, scale: 0.88, rotate: 6 }
          : { opacity: 1, x: 0, scale: 1, rotate: 0 }
      }
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
    >
      <span className="pm-nearby-card__glow" aria-hidden />
      <span className="pm-nearby-card__shine" aria-hidden />

      <AnimatePresence>
        {likePhase === 'burst' ? <NearbyLikeBurst /> : null}
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
        <NearbyLikeButton
          playerId={player.id}
          playerName={player.name}
          dismissAfterLike
          onPhaseChange={setLikePhase}
        />
      </div>
    </motion.article>
  )
}
