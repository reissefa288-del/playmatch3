import { useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { fakePortraitForProfile } from '../../../shared/fakePortraits'
import { INTEREST_EMOJI } from '../../onboarding/onboardingSteps'
import { formatPlayerLevel } from '../../profile/profileLevel'
import type { NearbyPlayer } from '../types'
import { useNearbyLikes } from '../useNearbyLikes'
import { NearbyGameInviteButton, type NearbyInvitePhase } from './NearbyGameInviteButton'
import { NearbyInviteBurst } from './NearbyInviteBurst'
import { NearbyLikeBurst } from './NearbyLikeBurst'
import { NearbyLikeButton, type NearbyLikePhase } from './NearbyLikeButton'

type NearbyPlayerListCardProps = {
  player: NearbyPlayer
  index?: number
}

const VISIBLE_INTERESTS = 2

export function NearbyPlayerListCard({ player, index = 0 }: NearbyPlayerListCardProps) {
  const reduceMotion = useReducedMotion()
  const { hasLiked } = useNearbyLikes()
  const liked = hasLiked(player.id)
  const [likePhase, setLikePhase] = useState<NearbyLikePhase>('idle')
  const [invitePhase, setInvitePhase] = useState<NearbyInvitePhase>('idle')
  const visibleInterests = player.interests.slice(0, VISIBLE_INTERESTS)
  const extraInterests = player.interests.length - visibleInterests.length
  const showBurst = likePhase === 'burst' || invitePhase === 'burst'

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
      <AnimatePresence mode="wait">
        {likePhase === 'burst' ? <NearbyLikeBurst key="like-burst" variant="list" /> : null}
        {invitePhase === 'burst' ? <NearbyInviteBurst key="invite-burst" variant="list" /> : null}
      </AnimatePresence>

      {liked && !showBurst ? (
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
          <FiMapPin aria-hidden /> {player.distance} · {formatPlayerLevel(player.level)}
        </p>
        <div className="pm-nearby-list-card__interests">
          {visibleInterests.map((interest) => (
            <span key={interest} className="pm-nearby-list-card__interest">
              {INTEREST_EMOJI[interest] ?? '•'} {interest}
            </span>
          ))}
          {extraInterests > 0 ? (
            <span className="pm-nearby-list-card__interest pm-nearby-list-card__interest--more">
              +{extraInterests}
            </span>
          ) : null}
        </div>
      </div>

      <div className="pm-nearby-list-card__actions">
        <NearbyLikeButton
          playerId={player.id}
          playerName={player.name}
          variant="list"
          dismissAfterLike={false}
          onPhaseChange={setLikePhase}
        />
        <NearbyGameInviteButton
          playerId={player.id}
          playerName={player.name}
          onPhaseChange={setInvitePhase}
        />
      </div>
    </motion.article>
  )
}
