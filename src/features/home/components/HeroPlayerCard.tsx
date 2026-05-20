import { useState } from 'react'
import {
  FiCheck,
  FiHeart,
  FiLock,
  FiMapPin,
  FiSend,
  FiX,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { IoShieldCheckmark } from 'react-icons/io5'
import { LuGamepad2 } from 'react-icons/lu'
import { MdEmojiEvents } from 'react-icons/md'
import { fakePortraitForGender } from '../../../shared/fakePortraits'
import type { HeroDiscoveryPlayer, HeroDiscoveryTag } from '../types'

export type HeroPlayerCardProps = {
  player: HeroDiscoveryPlayer
  showSentOverlay?: boolean
  matchBusy?: boolean
  isPeek?: boolean
  onMatchRequest?: () => void
  onPass?: () => void
}

function TagIcon({ tag }: { tag: HeroDiscoveryTag }) {
  if (tag.icon === 'trophy') return <MdEmojiEvents aria-hidden />
  return <LuGamepad2 aria-hidden />
}

export function HeroPlayerCard({
  player,
  showSentOverlay = false,
  matchBusy = false,
  isPeek = false,
  onMatchRequest,
  onPass,
}: HeroPlayerCardProps) {
  const [inviteHint, setInviteHint] = useState(false)
  const actionsLocked = showSentOverlay || matchBusy || isPeek

  const onLockedInvite = () => {
    setInviteHint(true)
    window.setTimeout(() => setInviteHint(false), 3800)
  }

  return (
    <article className={`pm-hero-card pm-hero-card--aaa${isPeek ? ' is-peek' : ''}`}>
      <span className="pm-hero-card__border-glow" aria-hidden />
      <span className="pm-hero-card__shine" aria-hidden />
      {showSentOverlay ? (
        <motion.div className="pm-hero-card__sent-overlay" role="status">
          <span className="pm-hero-card__sent-aurora" aria-hidden />
          <span className="pm-hero-card__sent-ring pm-hero-card__sent-ring--a" aria-hidden />
          <span className="pm-hero-card__sent-ring pm-hero-card__sent-ring--b" aria-hidden />
          <motion.div
            className="pm-hero-card__sent-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <span className="pm-hero-card__sent-icon" aria-hidden>
              <FiCheck />
            </span>
            <span className="pm-hero-card__sent-ping" aria-hidden>
              <FiSend />
            </span>
          </motion.div>
          <motion.strong
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Eşleşme isteği gönderildi
          </motion.strong>
          <motion.p
            className="pm-hero-card__sent-sub"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            Karşı tarafa bildirim gitti
          </motion.p>
          <motion.span
            className="pm-hero-card__sent-chip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Premium bildirim · anında iletildi
          </motion.span>
        </motion.div>
      ) : null}

      <div className="pm-hero-card__body">
        <div className="pm-hero-card__portrait-col">
          <div className="pm-hero-card__portrait" role="img" aria-label={player.name}>
            <img
              src={fakePortraitForGender(player.gender)}
              alt=""
              className="pm-hero-card__portrait-img"
              draggable={false}
            />
            {player.isOnline ? <span className="pm-status-pill">Online</span> : null}
          </div>
        </div>

        <div className="pm-hero-card__content-col">
          <div className="pm-hero-card__details">
            <div className="pm-hero-card__details-top">
              <h2>
                {player.name}{' '}
                {player.verified ? <IoShieldCheckmark aria-label="Doğrulanmış" /> : null}
                <span>{player.age}</span>
              </h2>

              <ul className="pm-hero-card__meta">
                <li>
                  <FiMapPin aria-hidden />
                  <span>{player.distance}</span>
                </li>
                <li>
                  <LuGamepad2 aria-hidden />
                  <span>{player.location}</span>
                </li>
                <li>
                  <span>{player.social.today}</span>
                </li>
                <li>
                  <span>{player.social.matches}</span>
                </li>
                <li>
                  <span>{player.social.mutuals}</span>
                </li>
                <li>
                  <span>{player.social.voice}</span>
                </li>
              </ul>
            </div>

            <div className="pm-hero-card__details-bottom">
              <div className="pm-tags">
                {player.tags.map((tag) => (
                  <span key={tag.label}>
                    <TagIcon tag={tag} /> {tag.label}
                  </span>
                ))}
              </div>

              <h3>Favori Oyunlar</h3>
              <div className="pm-favorites">
                {player.favoriteGames.map((game) => (
                  <div key={game.id} className="pm-mini-game">
                    {game.label}
                  </div>
                ))}
                <div className="pm-mini-game muted">+3</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-hero-card__actions pm-hero-card__actions--spread">
        {inviteHint ? (
          <p className="pm-hero-card__invite-hint" role="status">
            <FiLock aria-hidden />
            <span>
              Davet, eşleşme olunca açılır. <strong>Premium</strong> alarak istek
              yollayabilirsiniz.
            </span>
          </p>
        ) : null}

        <button
          type="button"
          className="pm-hero-btn pm-hero-btn--pass"
          disabled={actionsLocked}
          onClick={onPass}
        >
          <span className="pm-hero-btn__icon" aria-hidden>
            <FiX />
          </span>
          <span className="pm-hero-btn__label">Geç</span>
        </button>

        <button
          type="button"
          className={`pm-hero-btn pm-hero-btn--match${showSentOverlay ? ' is-sent' : ''}${matchBusy ? ' is-busy' : ''}`}
          disabled={actionsLocked || showSentOverlay}
          onClick={onMatchRequest}
        >
          <span className="pm-hero-btn__icon" aria-hidden>
            {matchBusy ? (
              <span className="pm-hero-btn__spinner" />
            ) : showSentOverlay ? (
              <FiCheck />
            ) : (
              <FiHeart />
            )}
          </span>
          <span className="pm-hero-btn__label">
            {matchBusy ? 'Gönderiliyor…' : showSentOverlay ? 'Gönderildi' : 'Eşleşme isteği'}
          </span>
        </button>

        <button
          type="button"
          className="pm-hero-btn pm-hero-btn--invite is-locked"
          disabled={actionsLocked}
          onClick={onLockedInvite}
        >
          <span className="pm-hero-btn__icon" aria-hidden>
            <LuGamepad2 />
            <FiLock className="pm-hero-btn__lock" />
          </span>
          <span className="pm-hero-btn__label">Oyuna Davet Et</span>
        </button>
      </div>
    </article>
  )
}
