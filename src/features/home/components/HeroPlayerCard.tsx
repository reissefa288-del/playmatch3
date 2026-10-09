import { lazy, memo, Suspense, useState, type CSSProperties } from 'react'
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
import { IoShieldCheckmark } from 'react-icons/io5'
import { LuGamepad2, LuRotateCcw } from 'react-icons/lu'
import { MdEmojiEvents } from 'react-icons/md'
import { fakePhotoSetForGender } from '../../../shared/fakePortraits'
import { PhotoImage } from '../../../shared/PhotoImage'
import { formatBalance } from '../../currency/GemBalanceProvider'
import { INTEREST_EMOJI } from '../../onboarding/onboardingSteps'
import type { HeroDiscoveryPlayer, HeroDiscoveryTag } from '../types'

const PhotoLightbox = lazy(() =>
  import('../../../shared/PhotoLightbox').then((mod) => ({ default: mod.PhotoLightbox })),
)

export type LightboxPhoto = import('../../../shared/PhotoLightbox').LightboxPhoto

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
  canUndo?: boolean
  onUndo?: () => void
  sentOverlayVariant?: 'match' | 'super'
  gemBalance?: number
  gemSpend?: (amount: number) => boolean
  gemBalanceLabel?: string
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

function heroPlayerCardPropsEqual(prev: HeroPlayerCardProps, next: HeroPlayerCardProps) {
  if (prev.isPeek !== next.isPeek) return false
  if (prev.player.id !== next.player.id) return false
  if (prev.showSentOverlay !== next.showSentOverlay) return false
  if (prev.matchBusy !== next.matchBusy) return false
  if (prev.canLike !== next.canLike) return false
  if (prev.isPremium !== next.isPremium) return false
  if (prev.sentOverlayVariant !== next.sentOverlayVariant) return false
  if (prev.gemBalance !== next.gemBalance) return false
  if (prev.gemBalanceLabel !== next.gemBalanceLabel) return false
  if (prev.onMatchRequest !== next.onMatchRequest) return false
  if (prev.onPass !== next.onPass) return false
  if (prev.onSuperLike !== next.onSuperLike) return false
  if (prev.canUndo !== next.canUndo) return false
  if (prev.onUndo !== next.onUndo) return false
  if (prev.onGameInvite !== next.onGameInvite) return false
  if (prev.gemSpend !== next.gemSpend) return false
  return true
}

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
  canUndo = false,
  onUndo,
  sentOverlayVariant = 'match',
  gemBalance,
  gemSpend,
  gemBalanceLabel,
}: HeroPlayerCardProps) {
  const [inviteHint, setInviteHint] = useState<'locked' | 'sent' | null>(null)
  const [superHint, setSuperHint] = useState<'gems' | 'sent' | null>(null)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const portraitPhoto = fakePhotoSetForGender(player.gender)
  const portraitFull = portraitPhoto.full.webp
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
    if (!gemSpend?.(SUPER_LIKE_GEM_COST)) {
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
        <div className="pm-hero-card__sent-overlay" role="status">
          <span className="pm-hero-card__sent-aurora" aria-hidden />
          <span className="pm-hero-card__sent-ring pm-hero-card__sent-ring--a" aria-hidden />
          <span className="pm-hero-card__sent-ring pm-hero-card__sent-ring--b" aria-hidden />
          <div
            className="pm-hero-card__sent-badge"
           
           
           
          >
            <span className="pm-hero-card__sent-icon" aria-hidden>
              <FiCheck />
            </span>
            <span className="pm-hero-card__sent-ping" aria-hidden>
              <FiSend />
            </span>
          </div>
          <strong
           
           
           
          >
            {sentOverlayVariant === 'super'
              ? 'Süper beğeni gönderildi'
              : 'Eşleşme isteği gönderildi'}
          </strong>
          <p
            className="pm-hero-card__sent-sub"
           
           
           
          >
            {sentOverlayVariant === 'super'
              ? `${player.name} profiline öne çıktın`
              : 'Karşı tarafa bildirim gitti'}
          </p>
          <span
            className="pm-hero-card__sent-chip"
           
           
           
          >
            {sentOverlayVariant === 'super'
              ? `${SUPER_LIKE_GEM_COST} elmas · öncelikli bildirim`
              : 'Premium bildirim · anında iletildi'}
          </span>
        </div>
      ) : null}

      <div className="pm-hero-card__body">
        <div className="pm-hero-card__portrait-col">
          <div
            className={`pm-hero-card__portrait${photosOpen ? ' is-photos-mode' : ''}`}
            role="img"
            aria-label={player.name}
          >
            <PhotoImage
              photo={portraitPhoto}
              alt=""
              className="pm-hero-card__portrait-img"
              sizes="(max-width: 480px) 390px, 960px"
              style={{ objectPosition: heroPhotoPositions[photoIndex] }}
              draggable={false}
              width={390}
              height={440}
              priority={!isPeek}
            />
            {photosOpen ? (
              <button
                type="button"
                className="pm-portrait-zoom-hit"
                aria-label="Fotoğrafı büyüt"
                onClick={() => setLightboxOpen(true)}
              />
            ) : null}
            {player.isOnline ? <span className="pm-status-pill">Çevrimiçi</span> : null}
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

      <div className="pm-hero-card__actions">
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
              <strong>{gemBalanceLabel ?? formatBalance(gemBalance ?? 0)}</strong>
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

        <div className="pm-hero-card__action-row">
          <button
            type="button"
            className="pm-hero-btn pm-hero-btn--pass"
            disabled={actionsLocked}
            aria-label="Geç"
            onClick={onPass}
          >
            <span className="pm-hero-btn__icon" aria-hidden>
              <FiX />
            </span>
          </button>

          <button
            type="button"
            className="pm-hero-btn pm-hero-btn--super"
            disabled={actionsLocked}
            onClick={onSuperLikeClick}
            aria-label={`Süper beğeni · ${SUPER_LIKE_GEM_COST} elmas`}
          >
            <span className="pm-hero-btn__icon" aria-hidden>
              <FiStar />
            </span>
          </button>

          <div
            className={`pm-hero-like${(matchBusy || showSentOverlay) && sentOverlayVariant === 'match' ? ' is-burst' : ''}`}
          >
            {isPremium && canUndo ? (
              <button type="button" className="pm-like-undo" aria-label="Geri al" onClick={onUndo}>
                <LuRotateCcw aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              className={`pm-hero-btn pm-hero-btn--match${showSentOverlay ? ' is-sent' : ''}${matchBusy ? ' is-busy' : ''}${!canLike ? ' is-exhausted' : ''}`}
              disabled={actionsLocked || showSentOverlay || !canLike}
              aria-label={
                matchBusy
                  ? 'Gönderiliyor'
                  : showSentOverlay
                    ? 'Gönderildi'
                    : !canLike
                      ? 'Beğeni hakkın bitti'
                      : 'Beğen'
              }
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
            </button>
            {(matchBusy || showSentOverlay) && sentOverlayVariant === 'match' ? (
              <span className="pm-like-burst" aria-hidden>
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} style={{ '--i': i } as CSSProperties} />
                ))}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className={`pm-hero-btn pm-hero-btn--invite${isPremium ? '' : ' is-locked'}`}
            disabled={actionsLocked}
            aria-label={isPremium ? 'Oyuna davet et' : 'Oyuna davet etmek için Premium gerekir'}
            onClick={onInviteClick}
          >
            <span className="pm-hero-btn__icon" aria-hidden>
              <LuGamepad2 />
              {!isPremium ? <FiLock className="pm-hero-btn__lock" /> : null}
            </span>
          </button>
        </div>
      </div>

      {lightboxOpen ? (
        <Suspense fallback={null}>
          <PhotoLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            imageSrc={portraitFull}
            photos={heroLightboxPhotos}
            index={photoIndex}
            onIndexChange={setPhotoIndex}
          />
        </Suspense>
      ) : null}
    </article>
  )
}, heroPlayerCardPropsEqual)
