import { FiEdit3 } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { profileRank, profileUser } from '../data'
import { ProfileRankCard } from './ProfileRankCard'

type ProfileHeroProps = {
  portraitUrl: string
}

export function ProfileHero({ portraitUrl }: ProfileHeroProps) {
  const progress = profileRank.current / profileRank.max

  return (
    <section
      className="pm-profile-hero"
      aria-label="Profil özeti"
     
     
     
    >
      <div
        className="pm-profile-avatar-wrap"
       
       
      >
        <div
          className="pm-profile-avatar"
         
         
        >
          <span className="pm-profile-avatar__ring" aria-hidden />
          <img
            src={portraitUrl}
            alt=""
            className="pm-profile-avatar__img"
            style={{ objectPosition: profileUser.portraitPosition }}
            draggable={false}
          />
          {profileUser.isOnline ? (
            <span className="pm-profile-avatar__online" aria-label="Çevrimiçi" />
          ) : null}
        </div>
      </div>

      <div
        className="pm-profile-hero__info"
       
       
       
      >
        <div className="pm-profile-hero__name-row">
          <h1>{profileUser.username}</h1>
          {profileUser.verified ? (
            <MdVerified className="pm-profile-hero__verified" aria-label="Doğrulanmış" />
          ) : null}
        </div>
        <p className="pm-profile-hero__meta">
          {profileUser.age} • {profileUser.location}
        </p>
        <p className="pm-profile-hero__bio">{profileUser.bio}</p>
        <button
          type="button"
          className="pm-profile-edit-btn"
         
         
        >
          <FiEdit3 aria-hidden />
          {profileUser.editLabel}
        </button>
      </div>

      <ProfileRankCard
        tier={profileRank.tier}
        label={profileRank.label}
        current={profileRank.current}
        max={profileRank.max}
        progress={progress}
        Emblem={profileRank.emblem}
      />
    </section>
  )
}
