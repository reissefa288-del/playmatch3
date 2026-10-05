import { useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { IoGameController } from 'react-icons/io5'
import type { MatchProfile } from '../../match/data'
import { useHasGameMatchedInvite, useGameMatchedInvitesActions } from '../GameMatchedInvitesProvider'
import { NearbyInviteBurst } from '../../home/components/NearbyInviteBurst'

const BURST_MS = 900

type MatchedPlayerInviteRowProps = {
  profile: MatchProfile
}

export function MatchedPlayerInviteRow({ profile }: MatchedPlayerInviteRowProps) {
  const { sendInvite } = useGameMatchedInvitesActions()
  const invited = useHasGameMatchedInvite(profile.id)
  const [burst, setBurst] = useState(false)
  const topGame = profile.favoriteGames[0]

  function handleInvite() {
    if (burst) return
    if (!invited) sendInvite(profile.id)
    setBurst(true)
    window.setTimeout(() => setBurst(false), BURST_MS)
  }

  return (
    <li className="pm-games-invite-row">
      <div
        className="pm-games-invite-row__portrait"
        style={{
          backgroundImage: `url(${profile.portraitSrc})`,
          backgroundPosition: profile.photos[0]?.objectPosition ?? '50% 12%',
        }}
        aria-hidden
      >
        {profile.online ? <span className="pm-games-invite-row__online" aria-hidden /> : null}
      </div>

      <div className="pm-games-invite-row__body">
        <h4>
          {profile.name}
          <span>{profile.age}</span>
          {profile.verified ? <FiCheckCircle aria-label="Doğrulanmış" /> : null}
        </h4>
        <p>{profile.distance}</p>
        {topGame ? (
          <span className="pm-games-invite-row__game">
            {topGame.emoji} {topGame.label}
          </span>
        ) : null}
      </div>

      <div className="pm-games-invite-row__action">
        <>{burst ? <NearbyInviteBurst variant="list" /> : null}</>
        <button
          type="button"
          className={`pm-games-invite-row__btn${invited ? ' is-invited' : ''}`}
          aria-label={invited ? `${profile.name} davet edildi` : `${profile.name} oyuna davet et`}
          aria-pressed={invited}
          disabled={burst}
          onClick={handleInvite}
         
        >
          <IoGameController aria-hidden />
          {invited ? 'Gönderildi' : 'Davet Et'}
        </button>
      </div>
    </li>
  )
}
