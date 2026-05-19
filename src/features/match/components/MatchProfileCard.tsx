import { FiHeart, FiMapPin } from 'react-icons/fi'
import { LuGamepad2, LuTarget, LuTrophy } from 'react-icons/lu'
import { MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'
import type { MatchGameChip, MatchStyleTag } from '../data'
import { matchPeekCards, matchProfile } from '../data'

const tagIcons = {
  gamepad: LuGamepad2,
  target: LuTarget,
  trophy: LuTrophy,
} as const

function TagIcon({ tag }: { tag: MatchStyleTag }) {
  const Icon = tagIcons[tag.icon]
  return <Icon aria-hidden />
}

type MatchProfileCardProps = {
  portraitUrl: string
}

export function MatchProfileCard({ portraitUrl }: MatchProfileCardProps) {
  const p = matchProfile

  return (
    <motion.div
      className="pm-match-card-wrap"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pm-match-peek pm-match-peek--left" aria-hidden>
        <div className="pm-match-peek__card" />
        <span className="pm-match-peek__name">{matchPeekCards.left.name}</span>
      </div>
      <div className="pm-match-peek pm-match-peek--right" aria-hidden>
        <div className="pm-match-peek__card" />
        <span className="pm-match-peek__name">{matchPeekCards.right.name}</span>
      </div>

      <div className="pm-match-card-stack pm-match-card-stack--a" aria-hidden />
      <div className="pm-match-card-stack pm-match-card-stack--b" aria-hidden />

      <article className="pm-match-hero-card">
        <div className="pm-match-hero-card__glow" aria-hidden />
        <div className="pm-match-hero-card__ring" aria-hidden />

        <div className="pm-match-portrait-stage">
          <img src={portraitUrl} alt="" className="pm-match-portrait-img" draggable={false} />
          <div className="pm-match-portrait-bloom" aria-hidden />
          <div className="pm-match-portrait-vignette" aria-hidden />
          <div className="pm-match-portrait-shade" aria-hidden />

          <div className="pm-match-badge pm-match-badge--online">
            <span className="pm-match-online-dot" />
            Online
          </div>

          <div className="pm-match-badge pm-match-badge--compat">
            <FiHeart aria-hidden />
            %{p.compatibility} Uyumluluk
          </div>

          <button type="button" className="pm-match-photos-btn">
            FOTO�RAFLARI G�R
          </button>

          <div className="pm-match-card-overlay">
            <div className="pm-match-name-row">
              <h2>{p.name}</h2>
              {p.verified ? (
                <MdVerified className="pm-match-verified" aria-label="Do�rulanm��" />
              ) : null}
              <span className="pm-match-age">{p.age}</span>
            </div>

            <p className="pm-match-location">
              <FiMapPin aria-hidden />
              <span>
                {p.distance}, {p.location}
              </span>
            </p>

            <div className="pm-match-tags">
              {p.tags.map((tag) => (
                <span key={tag.id} className="pm-match-tag">
                  <TagIcon tag={tag} />
                  {tag.label}
                </span>
              ))}
            </div>

            <p className="pm-match-games-label">Favori oyunlar�</p>
            <div className="pm-match-games">
              {p.favoriteGames.map((g: MatchGameChip) => (
                <span
                  key={g.id}
                  className={`pm-match-game${g.more ? ' is-more' : ''}`}
                  title={g.label}
                >
                  <span className="sr-only">{g.label}</span>
                  <span aria-hidden>{g.emoji}</span>
                </span>
              ))}
            </div>

            <p className="pm-match-bio">{p.bio}</p>
          </div>
        </div>
      </article>`n    </motion.div>
  )
}
