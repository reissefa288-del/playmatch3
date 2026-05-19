import { FiEdit3 } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { motion, useReducedMotion } from 'framer-motion'
import { profileRank, profileUser } from '../data'
import { ProfileRankCard } from './ProfileRankCard'

type ProfileHeroProps = {
  portraitUrl: string
}

export function ProfileHero({ portraitUrl }: ProfileHeroProps) {
  const reduceMotion = useReducedMotion()
  const progress = profileRank.current / profileRank.max

  return (
    <motion.section
      className="pm-profile-hero"
      aria-label="Profil özeti"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pm-profile-avatar-wrap"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="pm-profile-avatar"
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
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
        </motion.div>
      </motion.div>

      <motion.div
        className="pm-profile-hero__info"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
      >
        <motion.div className="pm-profile-hero__name-row">
          <h1>{profileUser.username}</h1>
          {profileUser.verified ? (
            <MdVerified className="pm-profile-hero__verified" aria-label="Doğrulanmış" />
          ) : null}
        </motion.div>
        <p className="pm-profile-hero__meta">
          {profileUser.age} • {profileUser.location}
        </p>
        <p className="pm-profile-hero__bio">{profileUser.bio}</p>
        <motion.button
          type="button"
          className="pm-profile-edit-btn"
          whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          <FiEdit3 aria-hidden />
          {profileUser.editLabel}
        </motion.button>
      </motion.div>

      <ProfileRankCard
        tier={profileRank.tier}
        label={profileRank.label}
        current={profileRank.current}
        max={profileRank.max}
        progress={progress}
        Emblem={profileRank.emblem}
      />
    </motion.section>
  )
}
