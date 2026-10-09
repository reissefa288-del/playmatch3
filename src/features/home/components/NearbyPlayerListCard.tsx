import { memo, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { LazyImage } from '../../../shared/LazyImage'
import { fakePortraitForGender } from '../../../shared/fakePortraits'
import { INTEREST_EMOJI } from '../../onboarding/onboardingSteps'
import { formatPlayerLevel } from '../../profile/profileLevel'
import type { NearbyPlayer } from '../types'
import { useHasLiked } from '../NearbyLikesProvider'
import { NearbyGameInviteButton, type NearbyInvitePhase } from './NearbyGameInviteButton'
import { NearbyInviteBurst } from './NearbyInviteBurst'
import { NearbyLikeBurst } from './NearbyLikeBurst'
import { NearbyLikeButton, type NearbyLikePhase } from './NearbyLikeButton'

type NearbyPlayerListCardProps = {
  player: NearbyPlayer
}

const VISIBLE_INTERESTS = 2

export const NearbyPlayerListCard = memo(function NearbyPlayerListCard({ player }: NearbyPlayerListCardProps) {
  const liked = useHasLiked(player.id)
  const [likePhase, setLikePhase] = useState<NearbyLikePhase>('idle')
  const [invitePhase, setInvitePhase] = useState<NearbyInvitePhase>('idle')
  const visibleInterests = player.interests.slice(0, VISIBLE_INTERESTS)
  const extraInterests = player.interests.length - visibleInterests.length
  const showBurst = likePhase === 'burst' || invitePhase === 'burst'

  const portraitSrc =
    player.portraitSrc?.trim() ||
    (player.gender ? fakePortraitForGender(player.gender) : undefined)

  return (
    <article
      className={`pm-nearby-list-card pm-nearby-list-card--aaa${liked ? ' is-liked-card' : ''}`}
     
     
     
    >
      <>
        {likePhase === 'burst' ? <NearbyLikeBurst key="like-burst" variant="list" /> : null}
        {invitePhase === 'burst' ? <NearbyInviteBurst key="invite-burst" variant="list" /> : null}
      </>

      {liked && !showBurst ? (
        <span className="pm-nearby-list-card__liked-badge" aria-label="Beğenildi">
          Beğenildi
        </span>
      ) : null}

      <div className="pm-nearby-list-card__portrait">
        {portraitSrc ? (
          <LazyImage
            src={portraitSrc}
            alt=""
            className="pm-nearby-list-card__photo"
            style={{ objectPosition: player.portraitPosition }}
            width={72}
            height={88}
            draggable={false}
          />
        ) : (
          <span
            className="pm-nearby-list-card__photo pm-nearby-list-card__photo--placeholder"
            aria-hidden
          />
        )}
        {player.isOnline ? <span className="pm-status-pill is-small">Çevrimiçi</span> : null}
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
    </article>
  )
})
