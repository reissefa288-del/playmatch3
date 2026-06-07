import { memo, useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiHeart,
  FiLock,
  FiMapPin,
  FiSend,
  FiStar,
  FiX,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { IoShieldCheckmark } from 'react-icons/io5'
import { LuGamepad2 } from 'react-icons/lu'
import { MdEmojiEvents } from 'react-icons/md'
import { fakePortraitForGender } from '../../../shared/fakePortraits'
import { LazyImage } from '../../../shared/LazyImage'
import { PhotoLightbox, type LightboxPhoto } from '../../../shared/PhotoLightbox'
import { formatBalance, useGemBalanceActions, useGemBalanceState } from '../../currency/GemBalanceProvider'
import { INTEREST_EMOJI } from '../../onboarding/onboardingSteps'
import type { HeroDiscoveryPlayer, HeroDiscoveryTag } from '../types'

export type HeroPlayerCardProps = {
  player: HeroDiscoveryPlayer
  showSentOverlay?: boolean
  matchBusy?: boolean
  canLike?: boolean
  isPremium?: boolean
  isPeek?: boolean
  onMatchRequest?: () => void
  onPass?: () => void
  onGameInvite?: () => void
  onSuperLike?: () => void
  sentOverlayVariant?: 'match' | 'super'
}

export const SUPER_LIKE_GEM_COST = 5

function TagIcon({ tag }: { tag: HeroDiscoveryTag }) {
  if (tag.icon === 'trophy') return <MdEmojiEvents aria-hidden />
  return <LuGamepad2 aria-hidden />
}

const heroPhotoPositions = ['50% 12%', '50% 35%', '50% 68%']

const heroLightboxPhotos: LightboxPhoto[] = heroPhotoPositions.map((objectPosition, index) => ({
  id: `hero-photo-${index}`,
  objectPosition,
}))

const VISIBLE_INTERESTS = 3

export const HeroPlayerCard = memo(function HeroPlayerCard({
  player,
  showSentOverlay = false,
  matchBusy = false,
  canLike = true,
  isPremium = false,
  isPeek = false,
  onMatchRequest,
  onPass,
  onGameInvite,
  onSuperLike,
  sentOverlayVariant = 'match',
}: HeroPlayerCardProps) {
  const { spend } = useGemBalanceActions()
  const { balance } = useGemBalanceState()
  const [inviteHint, setInviteHint] = useState<'locked' | 'sent' | null>(null)
  const [superHint, setSuperHint] = useState<'gems' | 'sent' | null>(null)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const portraitSrc = fakePortraitForGender(player.gender, 'display')
  const portraitFull = fakePortraitForGender(player.gender, 'full')
  const actionsLocked = showSentOverlay || matchBusy || isPeek
  const visibleInterests = player.interests.slice(0, VISIBLE_INTERESTS)
  const extraInterests = player.interests.length - visibleInterests.length

  const onInviteClick = () => {
    if (!isPremium) {
      setInviteHint('locked')
      window.setTimeout(() => setInviteHint(null), 3800)
      return
    }
    onGameInvite?.()
    setInviteHint('sent')
    window.setTimeout(() => setInviteHint(null), 3200)
  }

  const onSuperLikeClick = () => {
    if (actionsLocked) return
    if (!spend(SUPER_LIKE_GEM_COST)) {
      setSuperHint('gems')
      window.setTimeout(() => setSuperHint(null), 3800)
      return
    }
    onSuperLike?.()
    setSuperHint('sent')
    window.setTimeout(() => setSuperHint(null), 3200)
  }

  const openPhotos = () => {
    setPhotoIndex(0)
    setPhotosOpen(true)
  }

  const closePhotos = () => {
    setPhotosOpen(false)
    setLightboxOpen(false)
  }
  const canPrev = photoIndex > 0
  const canNext = photoIndex < heroPhotoPositions.length - 1

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
            {sentOverlayVariant === 'super'
              ? 'Süper beğeni gönderildi'
              : 'Eşleşme isteği gönderildi'}
          </motion.strong>
          <motion.p
            className="pm-hero-card__sent-sub"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            {sentOverlayVariant === 'super'
              ? `${player.name} profiline öne çıktın`
              : 'Karşı tarafa bildirim gitti'}
          </motion.p>
          <motion.span
            className="pm-hero-card__sent-chip"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {sentOverlayVariant === 'super'
              ? `${SUPER_LIKE_GEM_COST} elmas · öncelikli bildirim`
              : 'Premium bildirim · anında iletildi'}
          </motion.span>
        </motion.div>
      ) : null}

      <div className="pm-hero-card__body">
        <div className="pm-hero-card__portrait-col">
          <div
            className={`pm-hero-card__portrait${photosOpen ? ' is-photos-mode' : ''}`}
            role="img"
            aria-label={player.name}
          >
            <LazyImage
              src={portraitSrc}
              alt=""
              className="pm-hero-card__portrait-img"
              style={{ objectPosition: heroPhotoPositions[photoIndex] }}
              draggable={false}
              width={390}
              height={440}
            />
            {photosOpen ? (
              <button
                type="button"
                className="pm-portrait-zoom-hit"
                aria-label="Fotoğrafı büyüt"
                onClick={() => setLightboxOpen(true)}
              />
            ) : null}
            {player.isOnline ? <span className="pm-status-pill">Online</span> : null}
            {!isPeek && !photosOpen ? (
              <div className="pm-hero-card__photos-cta-wrap">
                <button type="button" className="pm-hero-card__photos-cta" onClick={openPhotos}>
                  FOTOĞRAFLARI GÖR
                </button>
              </div>
            ) : null}
            {!isPeek && photosOpen ? (
              <div className="pm-hero-card__photos-ui" role="dialog" aria-label="Profil fotoğrafları">
                <div className="pm-hero-card__photos-top">
                  <span>{photoIndex + 1} / {heroPhotoPositions.length}</span>
                  <button type="button" onClick={closePhotos} aria-label="Fotoğrafları kapat">
                    <FiX aria-hidden />
                  </button>
                </div>
                <div className="pm-hero-card__photos-dots" aria-hidden>
                  {heroPhotoPositions.map((_, index) => (
                    <span key={`hero-photo-dot-${index}`} className={index === photoIndex ? 'is-active' : ''} />
                  ))}
                </div>
                <button
                  type="button"
                  className="pm-hero-card__photos-nav pm-hero-card__photos-nav--prev"
                  onClick={() => setPhotoIndex((prev) => Math.max(0, prev - 1))}
                  disabled={!canPrev}
                  aria-label="Önceki fotoğraf"
                >
                  <FiChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  className="pm-hero-card__photos-nav pm-hero-card__photos-nav--next"
                  onClick={() => setPhotoIndex((prev) => Math.min(heroPhotoPositions.length - 1, prev + 1))}
                  disabled={!canNext}
                  aria-label="Sonraki fotoğraf"
                >
                  <FiChevronRight aria-hidden />
                </button>
              </div>
            ) : null}
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

              <h3>İlgi Alanları</h3>
              <div className="pm-hero-interests">
                {visibleInterests.map((interest) => (
                  <span key={interest} className="pm-hero-interest">
                    {INTEREST_EMOJI[interest] ?? '•'} {interest}
                  </span>
                ))}
                {extraInterests > 0 ? (
                  <span className="pm-hero-interest pm-hero-interest--more">+{extraInterests}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-hero-card__actions pm-hero-card__actions--spread">
        {inviteHint === 'locked' ? (
          <p className="pm-hero-card__invite-hint" role="status">
            <FiLock aria-hidden />
            <span>
              Oyuna davet etmek için <strong>Premium</strong> gerekir. Premium sekmesinden
              aktifleştirebilirsin.
            </span>
          </p>
        ) : null}
        {inviteHint === 'sent' ? (
          <p className="pm-hero-card__invite-hint pm-hero-card__invite-hint--sent" role="status">
            <LuGamepad2 aria-hidden />
            <span>
              <strong>Oyun daveti gönderildi.</strong> {player.name} lobine davet edildi.
            </span>
          </p>
        ) : null}
        {superHint === 'gems' ? (
          <p className="pm-hero-card__invite-hint pm-hero-card__invite-hint--gems" role="status">
            <FiStar aria-hidden />
            <span>
              Süper beğeni için <strong>{SUPER_LIKE_GEM_COST} elmas</strong> gerekir. Bakiye:{' '}
              <strong>{formatBalance(balance)}</strong>
            </span>
          </p>
        ) : null}
        {superHint === 'sent' && !showSentOverlay ? (
          <p className="pm-hero-card__invite-hint pm-hero-card__invite-hint--super" role="status">
            <FiStar aria-hidden />
            <span>
              <strong>Süper beğeni gönderildi.</strong> {player.name} seni öncelikli görecek.
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
          className={`pm-hero-btn pm-hero-btn--match${showSentOverlay ? ' is-sent' : ''}${matchBusy ? ' is-busy' : ''}${!canLike ? ' is-exhausted' : ''}`}
          disabled={actionsLocked || showSentOverlay || !canLike}
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
            {matchBusy
              ? 'Gönderiliyor…'
              : showSentOverlay
                ? 'Gönderildi'
                : !canLike
                  ? 'Beğeni hakkın bitti'
                  : 'Eşleşme isteği'}
          </span>
        </button>

        <button
          type="button"
          className={`pm-hero-btn pm-hero-btn--invite${isPremium ? '' : ' is-locked'}`}
          disabled={actionsLocked}
          onClick={onInviteClick}
        >
          <span className="pm-hero-btn__icon" aria-hidden>
            <LuGamepad2 />
            {!isPremium ? <FiLock className="pm-hero-btn__lock" /> : null}
          </span>
          <span className="pm-hero-btn__label">Oyuna Davet Et</span>
        </button>

        <button
          type="button"
          className="pm-hero-btn pm-hero-btn--super"
          disabled={actionsLocked}
          onClick={onSuperLikeClick}
          aria-label={`Süper beğeni gönder · ${SUPER_LIKE_GEM_COST} elmas`}
        >
          <span className="pm-hero-btn__icon" aria-hidden>
            <FiStar />
          </span>
          <span className="pm-hero-btn__label">Süper Beğeni</span>
          <span className="pm-hero-btn__gem-cost">{SUPER_LIKE_GEM_COST} elmas</span>
        </button>
      </div>

      <PhotoLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={portraitFull}
        photos={heroLightboxPhotos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />
    </article>
  )
})
