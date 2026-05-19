import { FiHeart } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { MdEmojiEvents } from 'react-icons/md'
import type { NearbyPlayer } from '../types'

type NearbyPlayerCardProps = {
  player: NearbyPlayer
  portraitImage: string
}

export function NearbyPlayerCard({ player, portraitImage }: NearbyPlayerCardProps) {
  return (
    <article className="pm-nearby-card">
      <div
        className="pm-nearby-card__image"
        style={{
          backgroundImage: `url(${portraitImage})`,
          backgroundPosition: player.portraitPosition,
        }}
      >
        <div className="pm-nearby-card__meta">
          <span className="pm-status-pill is-small">Online</span>
          <span className="pm-distance-pill">{player.distance}</span>
        </div>
      </div>

      <div className="pm-nearby-card__body">
        <h4>
          {player.name}
          {player.verified ? <IoShieldCheckmark /> : null}
          <span>{player.age}</span>
        </h4>
        <p>
          <MdEmojiEvents /> {player.rank}
        </p>
      </div>

      <div className="pm-nearby-card__games">
        {player.gameTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        <button type="button" aria-label={`${player.name} beğen`}>
          <FiHeart />
        </button>
      </div>
    </article>
  )
}