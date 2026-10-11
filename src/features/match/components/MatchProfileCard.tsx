import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
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

function ProfileSummary({ profile, menu }: { profile: MatchProfile; menu?: ReactNode }) {
  const about = cardBio(profile.bio)
  return (
    <div className="pm-match-card-summary">
      <div className="pm-match-name-row">
        <h2>{profile.name}</h2>
        {profile.verified ? <MdVerified className="pm-match-verified" aria-label="Doğrulanmış" /> : null}
        <span className="pm-match-age">{profile.age}</span>
        {menu}
      </div>
      <p className="pm-match-location">
        <FiMapPin aria-hidden />
        <span>
          {profile.distance}, {profile.location}
        </span>
      </p>
      <div className="pm-match-tags">
        {profile.tags.map((tag) => (
          <span key={tag.id} className="pm-match-tag">
            <TagIcon tag={tag} />
            {tag.label}
          </span>
        ))}
      </div>
      {about ? <p className="pm-match-card-bio">{about}</p> : null}
    </div>
  )
}

type MatchProfileCardProps = {
  profile: MatchProfile
  nextProfile?: MatchProfile | null
  onOpenModeration?: () => void
  onPass?: () => void
  onLike?: () => void
  canLike?: boolean
  canAct?: boolean
}

function matchProfileCardPropsEqual(prev: MatchProfileCardProps, next: MatchProfileCardProps) {
  if (prev.profile.id !== next.profile.id) return false
  if (prev.nextProfile?.id !== next.nextProfile?.id) return false
  if (prev.canLike !== next.canLike) return false
  if (prev.canAct !== next.canAct) return false
  return true
}

export const MatchProfileCard = memo(function MatchProfileCard({
  profile: p,
  nextProfile = null,
  onOpenModeration,
  onPass,
  onLike,
  canLike = true,
  canAct = true,
}: MatchProfileCardProps) {
  const photos =
    p.photos.length > 0
      ? p.photos
      : [{ id: `${p.id}-cover`, src: p.portraitSrc, objectPosition: '50% 12%' }]
  const count = photos.length
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [shift, setShift] = useState(0)
  const [lift, setLift] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'drag' | 'back' | 'out'>('idle')
  const photoRef = useRef<HTMLDivElement>(null)
  const point = useRef<{ x: number; y: number; pointer: number } | null>(null)
  const axis = useRef<'x' | 'y' | null>(null)
  const shiftRef = useRef(0)
  const profileId = useRef(p.id)
  const timers = useRef<number[]>([])
  profileId.current = p.id

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
    setShift(0)
    setLift(0)
    shiftRef.current = 0
    setPhase('idle')
    axis.current = null
  }, [p.id])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const fly = useCallback(
    (dir: -1 | 1, dy: number) => {
      const distance = dir * Math.max(window.innerWidth, 520)
      shiftRef.current = distance
      setShift(distance)
      setLift(dy + dir * -30)
      setPhase('out')
      const id = p.id
      timers.current.push(window.setTimeout(() => {
        if (dir < 0) onPass?.()
        else onLike?.()
      }, 280))
      timers.current.push(window.setTimeout(() => {
        if (profileId.current !== id) return
        shiftRef.current = 0
        setShift(0)
        setLift(0)
        setPhase('back')
      }, 900))
    },
    [onLike, onPass, p.id],
  )

  const onCardPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!canAct || phase === 'out') return
    if ((event.target as HTMLElement).closest('button, a')) return
    point.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId }
    axis.current = null
  }

  const onCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = point.current
    if (!start || start.pointer !== event.pointerId || phase === 'out') return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!axis.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axis.current === 'y') {
        point.current = null
        return
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (axis.current !== 'x') return
    const next = dx > 0 && !canLike ? dx * 0.28 : dx
    shiftRef.current = next
    setShift(next)
    setLift(dy)
    setPhase('drag')
  }

  const onCardPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = point.current
    if (!start || start.pointer !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    point.current = null
    const horizontal = axis.current === 'x'
    axis.current = null
    if (!horizontal) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) tapPhoto(event)
      return
    }
    const width = event.currentTarget.getBoundingClientRect().width
    const threshold = Math.min(112, width * 0.28)
    if (dx <= -threshold) {
      fly(-1, dy)
      return
    }
    if (dx >= threshold) {
      if (!canLike) {
        onLike?.()
        shiftRef.current = 0
        setShift(0)
        setLift(0)
        setPhase('back')
        return
      }
      fly(1, dy)
      return
    }
    shiftRef.current = 0
    setShift(0)
    setLift(0)
    setPhase('back')
  }

  const tapPhoto = (event: PointerEvent<HTMLElement>) => {
    const photo = photoRef.current
    if (!photo) return
    const bounds = photo.getBoundingClientRect()
    if (event.clientY < bounds.top || event.clientY > bounds.bottom) return
    if (event.clientX < bounds.left || event.clientX > bounds.right) return
    if (count < 2) {
      setLightboxOpen(true)
      return
    }
    const x = event.clientX - bounds.left
    if (x < bounds.width * 0.34) go(-1)
    else go(1)
  }

  const amount = Math.min(1, Math.abs(shift) / 100)
  const rotate = phase === 'out' ? Math.sign(shift || 1) * 20 : Math.max(-12, Math.min(12, shift / 18))

  return (
    <div className={`pm-match-card-wrap${phase === 'drag' ? ' is-dragging' : ''}`}>
      {nextProfile ? (
        <article className="pm-match-next-card" aria-hidden>
          <div className="pm-match-portrait-stage">
            <div className="pm-match-photo-area pm-match-photo-area--aaa">
              <img className="pm-match-portrait-img" src={nextProfile.portraitSrc} alt="" draggable={false} />
              <div className="pm-match-portrait-vignette" aria-hidden />
              {nextProfile.online ? (
                <div className="pm-match-badge pm-match-badge--online pm-match-badge--aaa">
                  <span className="pm-match-online-dot" aria-hidden />
                  Çevrimiçi
                </div>
              ) : null}
            </div>
            <ProfileSummary profile={nextProfile} />
          </div>
        </article>
      ) : null}

      <article
        className={`pm-match-hero-card pm-match-hero-card--aaa${phase === 'drag' ? ' is-swipe' : ''}${phase === 'back' ? ' is-swipe is-swipe-back' : ''}${phase === 'out' ? ' is-swipe is-swipe-out' : ''}`}
        style={
          phase === 'idle'
            ? undefined
            : {
                transform: `translate3d(${shift}px, ${lift}px, 0) rotate(${rotate}deg)`,
                transformOrigin: '50% 100%',
              }
        }
        onPointerDown={onCardPointerDown}
        onPointerMove={onCardPointerMove}
        onPointerUp={onCardPointerUp}
        onPointerCancel={onCardPointerUp}
      >
        <div className="pm-match-hero-card__glow" aria-hidden />
        <div className="pm-match-hero-card__ring" aria-hidden />

        <div className="pm-match-portrait-stage">
          <div className="pm-match-photo-area pm-match-photo-area--aaa" ref={photoRef}>
            <MatchPortraitCarousel photos={photos} index={photoIndex} dragPx={0} dragging={false} />
            <span className="pm-swipe-mark pm-swipe-mark--like" style={{ opacity: shift > 8 ? amount : 0 }} aria-hidden>
              LIKE
            </span>
            <span className="pm-swipe-mark pm-swipe-mark--nope" style={{ opacity: shift < -8 ? amount : 0 }} aria-hidden>
              NOPE
            </span>
            <button
              type="button"
              className="pm-match-photo-hit"
              tabIndex={-1}
              aria-hidden
            />

            <div className="pm-match-portrait-bloom" aria-hidden />
            <div className="pm-match-portrait-vignette" aria-hidden />

            <div className="pm-match-badge pm-match-badge--online pm-match-badge--aaa">
              <span className="pm-match-online-dot" aria-hidden />
              Çevrimiçi
            </div>

          </div>

          <ProfileSummary
            profile={p}
            menu={
              onOpenModeration ? (
                <button
                  type="button"
                  className="pm-match-name-row__menu"
                  aria-label="Diğer"
                  onClick={onOpenModeration}
                >
                  <FiMoreVertical aria-hidden />
                </button>
              ) : null
            }
          />
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
