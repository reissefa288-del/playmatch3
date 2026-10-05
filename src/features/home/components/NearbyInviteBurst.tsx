import { IoGameController } from 'react-icons/io5'
const PARTICLE_COUNT = 8

type NearbyInviteBurstProps = {
  variant?: 'card' | 'list'
}

export function NearbyInviteBurst({ variant = 'card' }: NearbyInviteBurstProps) {
  return (
    <div
      className={`pm-nearby-card__invite-burst${variant === 'list' ? ' pm-nearby-card__invite-burst--list' : ''}`}
     
     
     
      role="status"
      aria-live="polite"
    >
      <span className="pm-nearby-card__invite-burst-ring" aria-hidden />
      <span className="pm-nearby-card__invite-burst-icon" aria-hidden>
        <IoGameController />
      </span>
      <strong>Oyuna davet edildi!</strong>

      <div className="pm-nearby-card__invite-particles" aria-hidden>
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span
            key={i}
            className="pm-nearby-card__invite-particle"
            style={{ ['--i' as string]: String(i) }}
          >
            🎮
          </span>
        ))}
      </div>
    </div>
  )
}
