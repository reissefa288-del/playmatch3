import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { FiMapPin, FiMoreVertical } from 'react-icons/fi'
import { LuGamepad2, LuTarget, LuTrophy } from 'react-icons/lu'
import { MdVerified } from 'react-icons/md'
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

const HIDDEN_BIOS = new Set([
  'Ana sayfa denemesi için geçici bot profil.',
  'Oyunları denemek için geçici bot rakip.',
  'Hızlı düello için bot rakip.',
  'Muratpaşa’da check-in yaptı.',
])

function cardBio(bio: string) {
  const text = bio.trim()
  if (!text || HIDDEN_BIOS.has(text)) return ''
  return text
}

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
  const about = cardBio(p.bio)
  const photos =
    p.photos.length > 0
      ? p.photos
      : [{ id: `${p.id}-cover`, src: p.portraitSrc, objectPosition: '50% 12%' }]
  const count = photos.length
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [dragPx, setDragPx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragX = useRef<number | null>(null)

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

  useEffect(() => {
    setPhotoIndex(0)
    setLightboxOpen(false)
    setDragPx(0)
    setDragging(false)
  }, [p.id])

  const onPhotoPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragX.current = event.clientX
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPhotoPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragX.current == null || count < 2) return
    let px = event.clientX - dragX.current
    if (photoIndex <= 0 && px > 0) px *= 0.22
    if (photoIndex >= count - 1 && px < 0) px *= 0.22
    setDragPx(px)
  }

  const onPhotoPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragX.current == null) return
    const dx = event.clientX - dragX.current
    dragX.current = null
    setDragging(false)
    setDragPx(0)
    if (count < 2) {
      if (Math.abs(dx) < 12) setLightboxOpen(true)
      return
    }
    if (dx <= -48) {
      go(1)
      return
    }
    if (dx >= 48) {
      go(-1)
      return
    }
    if (Math.abs(dx) > 12) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    if (x < bounds.width * 0.34) go(-1)
    else go(1)
  }

  return (
    <div className="pm-match-card-wrap">
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
          <div className="pm-match-photo-area pm-match-photo-area--aaa">
            <MatchPortraitCarousel
              photos={photos}
              index={photoIndex}
              dragPx={dragPx}
              dragging={dragging}
            />
            <button
              type="button"
              className="pm-match-photo-hit"
              aria-label={count > 1 ? 'Fotoğraflar arasında geç' : 'Fotoğrafı büyüt'}
              onPointerDown={onPhotoPointerDown}
              onPointerMove={onPhotoPointerMove}
              onPointerUp={onPhotoPointerUp}
              onPointerCancel={onPhotoPointerUp}
            />

            <div className="pm-match-portrait-bloom" aria-hidden />
            <div className="pm-match-portrait-vignette" aria-hidden />

            <div className="pm-match-badge pm-match-badge--online pm-match-badge--aaa">
              <span className="pm-match-online-dot" aria-hidden />
              Çevrimiçi
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
            {about ? <p className="pm-match-card-bio">{about}</p> : null}
          </div>
        </div>
      </article>

      {lightboxOpen ? (
        <Suspense fallback={null}>
          <PhotoLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            imageSrc={p.portraitSrc}
            photos={photos}
            index={photoIndex}
            onIndexChange={setPhotoIndex}
          />
        </Suspense>
      ) : null}
    </div>
  )
}, matchProfileCardPropsEqual)
