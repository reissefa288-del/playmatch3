import { useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import type { NearbyPlayer } from '../types'
import { useNearbyLikes } from '../useNearbyLikes'
import { NearbyLikeBurst } from './NearbyLikeBurst'
import { NearbyLikeButton, type NearbyLikePhase } from './NearbyLikeButton'

type NearbyPlayerListCardProps = {
  player: NearbyPlayer
  index?: number
}

export function NearbyPlayerListCard({ player, index = 0 }: NearbyPlayerListCardProps) {
  const reduceMotion = useReducedMotion()
  const { hasLiked } = useNearbyLikes()
  const liked = hasLiked(player.id)
  const [likePhase, setLikePhase] = useState<NearbyLikePhase>('idle')

  return (
    <motion.article
      className={`pm-nearby-list-card pm-nearby-list-card--aaa${liked ? ' is-liked-card' : ''}`}
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 30,
        delay: reduceMotion ? 0 : index * 0.04,
      }}
    >
      <AnimatePresence>
        {likePhase === 'burst' ? <NearbyLikeBurst variant="list" /> : null}
      </AnimatePresence>

      {liked ? (
        <span className="pm-nearby-list-card__liked-badge" aria-label="Beğenildi">
          Beğenildi
        </span>
      ) : null}

      <div
        className="pm-nearby-list-card__portrait"
        style={{
          backgroundImage: `url(${fakePortraitForProfile(player.id, player.gender)})`,
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

      <NearbyLikeButton
        playerId={player.id}
        playerName={player.name}
        variant="list"
        dismissAfterLike={false}
        onPhaseChange={setLikePhase}
        className="pm-nearby-list-card__like-slot"
      />
    </motion.article>
  )
}
