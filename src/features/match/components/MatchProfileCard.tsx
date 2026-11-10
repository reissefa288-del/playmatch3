import {
  forwardRef,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import locationPin from '../assets/location-pin.png'
import type { MatchProfile } from '../data'
import { MatchPortraitCarousel } from './MatchPortraitCarousel'

export type MatchProfileCardHandle = {
  triggerPass: () => void
  triggerLike: () => void
  triggerSuperLike: () => void
}

const PhotoLightbox = lazy(() =>
  import('../../../shared/PhotoLightbox').then((mod) => ({ default: mod.PhotoLightbox })),
)

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
        <img src={locationPin} alt="" width={15} height={18} draggable={false} />
        <span>
          {profile.distance}, {profile.location}
        </span>
      </p>
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
  onSuperLike?: () => void
  canLike?: boolean
  canAct?: boolean
  /** Aksiyon satırı — kart çerçevesinin içinde render edilir */
  footer?: ReactNode
}

function matchProfileCardPropsEqual(prev: MatchProfileCardProps, next: MatchProfileCardProps) {
  if (prev.profile.id !== next.profile.id) return false
  if (prev.nextProfile?.id !== next.nextProfile?.id) return false
  if (prev.canLike !== next.canLike) return false
  if (prev.canAct !== next.canAct) return false
  if (prev.footer !== next.footer) return false
  return true
}

export const MatchProfileCard = memo(
  forwardRef<MatchProfileCardHandle, MatchProfileCardProps>(function MatchProfileCard(
  {
  profile: p,
  nextProfile = null,
  onOpenModeration,
  onPass,
  onLike,
  onSuperLike,
  canLike = true,
  canAct = true,
  footer,
},
  ref,
) {
  const photos =
    p.photos.length > 0
      ? p.photos
      : [{ id: `${p.id}-cover`, src: p.portraitSrc, objectPosition: '50% 12%' }]
  const count = photos.length
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [shift, setShift] = useState(0)
  const [lift, setLift] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'drag' | 'back' | 'out' | 'super'>('idle')
  const [stamp, setStamp] = useState<'like' | 'nope' | 'super' | null>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const point = useRef<{ x: number; y: number; pointer: number } | null>(null)
  const axis = useRef<'x' | 'y' | null>(null)
  const shiftRef = useRef(0)
  const profileId = useRef(p.id)
  const timers = useRef<number[]>([])
  const busy = useRef(false)
  const canLikeRef = useRef(canLike)
  const canActRef = useRef(canAct)
  profileId.current = p.id
  canLikeRef.current = canLike
  canActRef.current = canAct

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
    setStamp(null)
    busy.current = false
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
      if (busy.current) return
      busy.current = true
      const mark = dir < 0 ? 'nope' : 'like'
      setStamp(mark)
      const distance = dir * Math.max(window.innerWidth, 520)
      shiftRef.current = distance
      setShift(distance)
      setLift(dy + dir * -30)
      setPhase('out')
      const id = p.id
      timers.current.push(
        window.setTimeout(() => {
          if (dir < 0) onPass?.()
          else onLike?.()
        }, 320),
      )
      timers.current.push(
        window.setTimeout(() => {
          if (profileId.current !== id) return
          shiftRef.current = 0
          setShift(0)
          setLift(0)
          setStamp(null)
          setPhase('back')
          busy.current = false
        }, 900),
      )
    },
    [onLike, onPass, p.id],
  )

  const flySuper = useCallback(() => {
    if (busy.current || !canActRef.current) return
    busy.current = true
    setStamp('super')
    shiftRef.current = 0
    setShift(0)
    setLift(-Math.max(window.innerHeight * 0.85, 640))
    setPhase('super')
    const id = p.id
    timers.current.push(
      window.setTimeout(() => {
        onSuperLike?.()
      }, 380),
    )
    timers.current.push(
      window.setTimeout(() => {
        if (profileId.current !== id) return
        setLift(0)
        setStamp(null)
        setPhase('back')
        busy.current = false
      }, 980),
    )
  }, [onSuperLike, p.id])

  useImperativeHandle(
    ref,
    () => ({
      triggerPass: () => {
        if (!canActRef.current) return
        fly(-1, 0)
      },
      triggerLike: () => {
        if (!canActRef.current) return
        if (!canLikeRef.current) {
          onLike?.()
          return
        }
        fly(1, 0)
      },
      triggerSuperLike: () => {
        flySuper()
      },
    }),
    [fly, flySuper, onLike],
  )

  const onCardPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!canAct || phase === 'out' || phase === 'super' || busy.current) return
    if ((event.target as HTMLElement).closest('button, a')) return
    point.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId }
    axis.current = null
  }

  const onCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = point.current
    if (!start || start.pointer !== event.pointerId || phase === 'out' || phase === 'super') return
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
  const rotate =
    phase === 'super'
      ? 0
      : phase === 'out'
        ? Math.sign(shift || 1) * 20
        : Math.max(-12, Math.min(12, shift / 18))
  const likeOpacity = stamp === 'like' ? 1 : shift > 8 ? amount : 0
  const nopeOpacity = stamp === 'nope' ? 1 : shift < -8 ? amount : 0
  const superOpacity = stamp === 'super' ? 1 : 0

  return (
    <div className={`pm-match-card-wrap${phase === 'drag' ? ' is-dragging' : ''}`}>
      {nextProfile ? (
        <article className="pm-match-next-card" aria-hidden>
          <div className="pm-match-hero-card__ring" />
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
              <div className="pm-match-card-overlay">
                <ProfileSummary profile={nextProfile} />
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <article
        className={`pm-match-hero-card pm-match-hero-card--aaa${phase === 'drag' ? ' is-swipe' : ''}${phase === 'back' ? ' is-swipe is-swipe-back' : ''}${phase === 'out' ? ' is-swipe is-swipe-out' : ''}${phase === 'super' ? ' is-swipe is-swipe-super' : ''}`}
        style={
          phase === 'idle'
            ? undefined
            : {
                transform: `translate3d(${shift}px, ${lift}px, 0) rotate(${rotate}deg)`,
                transformOrigin: phase === 'super' ? '50% 50%' : '50% 100%',
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
            <span className="pm-swipe-mark pm-swipe-mark--like" style={{ opacity: likeOpacity }} aria-hidden>
              LIKE
            </span>
            <span className="pm-swipe-mark pm-swipe-mark--nope" style={{ opacity: nopeOpacity }} aria-hidden>
              NOPE
            </span>
            <span className="pm-swipe-mark pm-swipe-mark--super" style={{ opacity: superOpacity }} aria-hidden>
              SUPER LIKE
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

            <div className="pm-match-card-overlay">
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
              {footer ? <div className="pm-match-card-footer">{footer}</div> : null}
            </div>
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
}),
  matchProfileCardPropsEqual,
)
