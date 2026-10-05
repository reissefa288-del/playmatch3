import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { memo, useEffect, useState } from 'react'
import { IoShieldCheckmark } from 'react-icons/io5'
import { MdEmojiEvents } from 'react-icons/md'
import { LazyImage } from '../../../shared/LazyImage'
import { fakePortraitForGender } from '../../../shared/fakePortraits'
import { INTEREST_EMOJI } from '../../onboarding/onboardingSteps'
import { formatPlayerLevel } from '../../profile/profileLevel'
import type { NearbyPlayer } from '../types'
import { NearbyLikeBurst } from './NearbyLikeBurst'
import { NearbyLikeButton, type NearbyLikePhase } from './NearbyLikeButton'

type NearbyPlayerCardProps = {
  player: NearbyPlayer
  onDismissed?: (playerId: string) => void
}

export const NearbyPlayerCard = memo(function NearbyPlayerCard({
  player,
  onDismissed,
}: NearbyPlayerCardProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [likePhase, setLikePhase] = useState<NearbyLikePhase>('idle')

  useEffect(() => {
    if (likePhase !== 'exit') return
    const ms = reduceMotion ? 0 : 420
    const id = window.setTimeout(() => onDismissed?.(player.id), ms)
    return () => window.clearTimeout(id)
  }, [likePhase, onDismissed, player.id, reduceMotion])

  const portraitSrc =
    player.portraitSrc?.trim() ||
    (player.gender ? fakePortraitForGender(player.gender) : undefined)

  return (
    <article
      className={[
        'pm-nearby-card',
        'pm-nearby-card--aaa',
        likePhase === 'exit' && !reduceMotion ? 'is-exiting' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="pm-nearby-card__glow" aria-hidden />
      <span className="pm-nearby-card__shine" aria-hidden />

      {likePhase === 'burst' ? <NearbyLikeBurst /> : null}

      <div className="pm-nearby-card__image">
        {portraitSrc ? (
          <LazyImage
            src={portraitSrc}
            alt=""
            className="pm-nearby-card__photo"
            style={{ objectPosition: player.portraitPosition }}
            width={156}
            height={156}
            draggable={false}
          />
        ) : (
          <span className="pm-nearby-card__photo pm-nearby-card__photo--placeholder" aria-hidden />
        )}
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
          <MdEmojiEvents aria-hidden /> {formatPlayerLevel(player.level)}
        </p>
      </div>

      <div className="pm-nearby-card__footer">
        <div className="pm-nearby-card__tags">
          {player.interests.map((interest) => (
            <span key={interest}>
              {INTEREST_EMOJI[interest] ?? '•'} {interest}
            </span>
          ))}
        </div>
        <NearbyLikeButton
          playerId={player.id}
          playerName={player.name}
          dismissAfterLike
          onPhaseChange={setLikePhase}
        />
      </div>
    </article>
  )
})
