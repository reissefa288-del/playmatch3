import { useState } from 'react'
import {
  FiCheck,
  FiHeart,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiSend,
  FiUserPlus,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { IoShieldCheckmark } from 'react-icons/io5'
import { LuGamepad2 } from 'react-icons/lu'
import { MdEmojiEvents } from 'react-icons/md'
import type { HeroConnectionStatus, HeroDiscoveryPlayer, HeroDiscoveryTag } from '../types'

export type HeroPlayerCardProps = {
  player: HeroDiscoveryPlayer
  portraitImage: string
  showSentOverlay?: boolean
  matchBusy?: boolean
  isPeek?: boolean
  onMatchRequest?: () => void
}

function TagIcon({ tag }: { tag: HeroDiscoveryTag }) {
  if (tag.icon === 'trophy') return <MdEmojiEvents aria-hidden />
  return <LuGamepad2 aria-hidden />
}

export function HeroPlayerCard({
  player,
  portraitImage,
  showSentOverlay = false,
  matchBusy = false,
  isPeek = false,
  onMatchRequest,
}: HeroPlayerCardProps) {
  const [connectionStatus] = useState<HeroConnectionStatus>('none')
  const [gateHint, setGateHint] = useState<string | null>(null)

  const matched = connectionStatus === 'matched'
  const canMessage = matched
  const canInvite = matched
  const actionsLocked = showSentOverlay || matchBusy || isPeek

  const showGateNote = !matched && !showSentOverlay && !isPeek

  const onLockedAction = (label: string) => {
    setGateHint(`${label} — eşleşme olunca açılır`)
    window.setTimeout(() => setGateHint(null), 2200)
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

      <div className="pm-hero-card__compat-float" aria-label={`${player.compatibility}% uyumluluk`}>
        <FiHeart />
        <span>%{player.compatibility}</span>
        <small>Uyumluluk</small>
      </div>

      <div className="pm-hero-card__body">
        <div className="pm-hero-card__portrait-col">
          <div
            className="pm-hero-card__portrait"
            style={{
              backgroundImage: `url(${portraitImage})`,
              backgroundPosition: player.portraitPosition,
            }}
            role="img"
            aria-label={player.name}
          >
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

      <div className="pm-hero-card__actions">
        {gateHint ? (
          <p className="pm-hero-card__gate-hint" role="status">
            <FiLock aria-hidden /> {gateHint}
          </p>
        ) : showGateNote ? (
          <p className="pm-hero-card__gate-note">
            <FiLock aria-hidden /> Mesaj ve davet eşleşme olunca açılır
          </p>
        ) : null}

        <button
          className={`pm-secondary${!canMessage ? ' is-locked' : ''}`}
          type="button"
          disabled={actionsLocked}
          onClick={() => (canMessage ? undefined : onLockedAction('Mesaj gönder'))}
          aria-disabled={!canMessage}
        >
          {!canMessage ? <FiLock aria-hidden /> : <FiMessageCircle aria-hidden />}
          Mesaj Gönder
        </button>

        <button
          className={`pm-primary${showSentOverlay ? ' is-sent' : ''}`}
          type="button"
          disabled={actionsLocked || showSentOverlay}
          onClick={onMatchRequest}
        >
          {matchBusy ? (
            <>Gönderiliyor…</>
          ) : showSentOverlay ? (
            <>
              <FiCheck aria-hidden /> Gönderildi
            </>
          ) : (
            <>
              <FiHeart aria-hidden /> Eşleşme isteği
            </>
          )}
        </button>

        <button
          className={`pm-secondary is-blue${!canInvite ? ' is-locked' : ''}`}
          type="button"
          disabled={actionsLocked}
          onClick={() => (canInvite ? undefined : onLockedAction('Oyuna davet et'))}
          aria-disabled={!canInvite}
        >
          {!canInvite ? <FiLock aria-hidden /> : <FiUserPlus aria-hidden />}
          Oyuna Davet Et
        </button>
      </div>
    </article>
  )
}
