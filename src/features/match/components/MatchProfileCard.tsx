import { lazy, memo, Suspense, useCallback, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiHeart, FiMapPin, FiMoreVertical, FiX } from 'react-icons/fi'
import { LuGamepad2, LuTarget, LuTrophy } from 'react-icons/lu'
import { MdVerified } from 'react-icons/md'
import { LazyImage } from '../../../shared/LazyImage'
import type { MatchProfile, MatchStyleTag } from '../data'
import { MatchPortraitCarousel } from './MatchPortraitCarousel'

const PhotoLightbox = lazy(() =>
  import('../../../shared/PhotoLightbox').then((mod) => ({ default: mod.PhotoLightbox })),
)

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
  profile: MatchProfile
  peekLeftName?: string
  peekRightName?: string
  onOpenModeration?: () => void
}

function matchProfileCardPropsEqual(prev: MatchProfileCardProps, next: MatchProfileCardProps) {
  if (prev.profile.id !== next.profile.id) return false
  if (prev.peekLeftName !== next.peekLeftName) return false
  if (prev.peekRightName !== next.peekRightName) return false
  return true
}

export const MatchProfileCard = memo(function MatchProfileCard({
  profile: p,
  peekLeftName,
  peekRightName,
  onOpenModeration,
}: MatchProfileCardProps) {
  const count = p.photos.length
  const [photoIndex, setPhotoIndex] = useState(0)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return
      setPhotoIndex((i) => {
        const next = i + delta
        if (next < 0 || next >= count) return i
        return next
      })
    },
    [count],
  )

  const openPhotos = useCallback(() => {
    setPhotoIndex(0)
    setPhotosOpen(true)
  }, [])

  const closePhotos = useCallback(() => {
    setPhotosOpen(false)
    setLightboxOpen(false)
  }, [])

  const canPrev = photosOpen && photoIndex > 0
  const canNext = photosOpen && photoIndex < count - 1
  const mainPhoto = p.photos[0] ?? { src: p.portraitSrc, objectPosition: '50% 20%' }

  return (
    <div className={`pm-match-card-wrap${photosOpen ? ' is-photos-mode' : ''}`}>
      <div className="pm-match-peek pm-match-peek--left" aria-hidden>
        <div className="pm-match-peek__card" />
        <span className="pm-match-peek__name">{peekLeftName ?? '···'}</span>
      </div>
      <div className="pm-match-peek pm-match-peek--right" aria-hidden>
        <div className="pm-match-peek__card" />
        <span className="pm-match-peek__name">{peekRightName ?? '···'}</span>
      </div>

      <div className="pm-match-card-stack pm-match-card-stack--a" aria-hidden />
      <div className="pm-match-card-stack pm-match-card-stack--b" aria-hidden />

      <article className="pm-match-hero-card pm-match-hero-card--aaa">
        <div className="pm-match-hero-card__glow" aria-hidden />
        <div className="pm-match-hero-card__ring" aria-hidden />

        <div className="pm-match-portrait-stage">
          <div
            className={`pm-match-photo-area pm-match-photo-area--aaa${photosOpen ? ' is-photos-open' : ''}`}
          >
            {photosOpen ? (
              <>
                <MatchPortraitCarousel photos={p.photos} index={photoIndex} />
                <button
                  type="button"
                  className="pm-portrait-zoom-hit"
                  aria-label="Fotoğrafı büyüt"
                  onClick={() => setLightboxOpen(true)}
                />
              </>
            ) : (
              <LazyImage
                src={mainPhoto.src}
                alt=""
                className="pm-match-portrait-img"
                style={{ objectPosition: mainPhoto.objectPosition }}
                draggable={false}
                priority
                width={390}
                height={520}
              />
            )}

            <div className="pm-match-portrait-bloom" aria-hidden />
            <div className="pm-match-portrait-vignette" aria-hidden />
            <div className="pm-match-portrait-shade" aria-hidden />

            <div className="pm-match-badge pm-match-badge--online pm-match-badge--aaa">
              <span className="pm-match-online-dot" />
              Online
            </div>

            <div className="pm-match-badge pm-match-badge--compat pm-match-badge--aaa">
              <FiHeart aria-hidden />
              %{p.compatibility} Uyumluluk
            </div>

            {photosOpen ? (
              <div
                className="pm-match-photo-ui pm-match-photo-ui--aaa"
                role="dialog"
                aria-modal="true"
                aria-label="Profil fotoğrafları"
              >
                <div className="pm-match-photo-ui__top">
                  <span className="pm-match-photo-ui__count">
                    {photoIndex + 1} / {count}
                  </span>
                  <button
                    type="button"
                    className="pm-match-photo-ui__close"
                    onClick={closePhotos}
                    aria-label="Fotoğrafları kapat"
                  >
                    <FiX aria-hidden />
                  </button>
                </div>

                <div className="pm-match-photo-dots" aria-hidden>
                  {p.photos.map((photo, i) => (
                    <span key={photo.id} className={i === photoIndex ? 'is-active' : ''} />
                  ))}
                </div>

                <button
                  type="button"
                  className="pm-match-photo-ui__nav pm-match-photo-ui__nav--prev"
                  onClick={() => go(-1)}
                  disabled={!canPrev}
                  aria-label="Önceki fotoğraf"
                >
                  <FiChevronLeft aria-hidden />
                </button>

                <button
                  type="button"
                  className="pm-match-photo-ui__nav pm-match-photo-ui__nav--next"
                  onClick={() => go(1)}
                  disabled={!canNext}
                  aria-label="Sonraki fotoğraf"
                >
                  <FiChevronRight aria-hidden />
                </button>
              </div>
            ) : null}

            <div className="pm-match-photo-footer">
              {!photosOpen ? (
                <button
                  type="button"
                  className="pm-match-photos-btn pm-match-photos-btn--aaa"
                  onClick={openPhotos}
                  aria-expanded={false}
                >
                  FOTOĞRAFLARI GÖR
                </button>
              ) : null}
            </div>
          </div>

          <div className="pm-match-card-summary">
            <div className="pm-match-name-row">
              <h2>{p.name}</h2>
              {p.verified ? (
                <MdVerified className="pm-match-verified" aria-label="Doğrulanmış" />
              ) : null}
              <span className="pm-match-age">{p.age}</span>
              {onOpenModeration ? (
                <button
                  type="button"
                  className="pm-match-name-row__menu"
                  aria-label="Diğer"
                  onClick={onOpenModeration}
                >
                  <FiMoreVertical aria-hidden />
                </button>
              ) : null}
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
          </div>
        </div>
      </article>

      <aside className="pm-match-profile-extra pm-match-profile-extra--aaa">
        <div className="pm-match-about-bar pm-match-about-bar--aaa">
          <p className="pm-match-about-label">Hakkımda</p>
          <p className="pm-match-about-text">{p.bio}</p>
        </div>
      </aside>

      {lightboxOpen ? (
        <Suspense fallback={null}>
          <PhotoLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            imageSrc={p.portraitSrc}
            photos={p.photos}
            index={photoIndex}
            onIndexChange={setPhotoIndex}
          />
        </Suspense>
      ) : null}
    </div>
  )
}, matchProfileCardPropsEqual)
