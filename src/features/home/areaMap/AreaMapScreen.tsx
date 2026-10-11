import { useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent as ReactAnimationEvent } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import { ShopGlassShader } from '../../currency/ShopGlassShader'
import { createHomeFemaleBots, isGameTestBotPlayerId } from '../../games/gameTestBot'
import { useAuthSession } from '../../auth/useAuthSession'
import { useDailyLikes } from '../../likes/useDailyLikes'
import { MatchProfileCard } from '../../match/components/MatchProfileCard'
import { DAILY_LIKES_LIMIT, type MatchProfile } from '../../match/data'
import actionLike from '../../match/assets/action-like.png'
import actionPass from '../../match/assets/action-pass.png'
import actionSuper from '../../match/assets/action-super.png'
import { AreaNotice, type AreaNoticeKind, type AreaNoticePayload } from './AreaNotice'
import { AreaStamp, type AreaStampKind } from './AreaStamp'
import { sendLikeAndRefresh } from '../../match/matchConnectionsStore'
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import type { NearbyPlayer } from '../types'
import { useNearbyPlayers } from '../useNearbyPlayers'
import { bandLabel, coarseKm, layoutArea, type AreaPerson, type AreaSpot } from './placeInArea'
import '../../../styles/area-map.css'

const RADII = [2, 5, 10] as const

type AreaMapScreenProps = {
  onClose: () => void
}

function ringLabels(radiusKm: number): [string, string, string] {
  if (radiusKm <= 2) return ['yakın', '~1 km', '~2 km']
  if (radiusKm <= 5) return ['~1 km', '~3 km', '~5 km']
  return ['~2 km', '~5 km', '~10 km']
}

function toPerson(profile: MatchProfile): AreaPerson {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    photo: profile.portraitSrc,
    objectPosition: profile.photos[0]?.objectPosition || '50% 12%',
    online: profile.online,
    bio: profile.bio,
    km: coarseKm(profile.distance),
    profile,
  }
}

function nearbyProfile(player: NearbyPlayer): MatchProfile {
  const photo = player.portraitSrc ?? ''
  return {
    id: player.id,
    name: player.name,
    age: player.age,
    gender: player.gender ?? 'female',
    portraitSrc: photo,
    verified: player.verified,
    online: Boolean(player.isOnline),
    compatibility: 0,
    province: '',
    distance: bandLabel(coarseKm(player.distance)),
    location: 'çevrende',
    tags: player.interests.slice(0, 3).map((label) => ({ id: label, label, icon: 'gamepad' as const })),
    favoriteGames: [],
    bio: player.recentActivity ?? '',
    photos: [{ id: `${player.id}-cover`, src: photo, objectPosition: player.portraitPosition || '50% 12%' }],
  }
}

export function AreaMapScreen({ onClose }: AreaMapScreenProps) {
  const reduceMotion = usePrefersReducedMotion()
  const { session } = useAuthSession()
  const { tryConsumeLike, remaining, isUnlimited } = useDailyLikes()
  const { players } = useNearbyPlayers({ gender: 'all', maxDistanceKm: 10, onlineOnly: false })
  const [radiusKm, setRadiusKm] = useState<(typeof RADII)[number]>(5)
  const [openSpot, setOpenSpot] = useState<AreaSpot | null>(null)
  const [pinCenter, setPinCenter] = useState<{ x: number; y: number } | null>(null)
  const [origin, setOrigin] = useState('50% 70%')
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<AreaNoticePayload | null>(null)
  const [sent, setSent] = useState<Record<string, 'like' | 'super'>>({})
  const [burst, setBurst] = useState<AreaStampKind | null>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const toastSeq = useRef(0)
  const burstAfter = useRef<(() => void) | null>(null)

  const people = useMemo(() => {
    const byId = new Map<string, AreaPerson>()
    for (const player of players) {
      if (!player.portraitSrc) continue
      byId.set(player.id, toPerson(nearbyProfile(player)))
    }
    for (const bot of createHomeFemaleBots()) {
      if (byId.has(bot.id)) continue
      byId.set(bot.id, toPerson(bot))
    }
    return [...byId.values()]
  }, [players])

  const spots = useMemo(() => layoutArea(people, radiusKm), [people, radiusKm])
  const labels = ringLabels(radiusKm)

  useLayoutEffect(() => {
    if (!openSpot || !pinCenter) return
    const sheet = sheetRef.current
    if (!sheet) return
    const box = sheet.getBoundingClientRect()
    setOrigin(`${pinCenter.x - box.left}px ${pinCenter.y - box.top}px`)
    setEntered(true)
  }, [openSpot, pinCenter])

  useEffect(() => {
    if (!openSpot) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (reduceMotion) {
        setOpenSpot(null)
        setEntered(false)
        setClosing(false)
        return
      }
      setClosing(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSpot, reduceMotion])

  function openProfile(spot: AreaSpot, pin: HTMLButtonElement) {
    const box = pin.getBoundingClientRect()
    setClosing(false)
    setEntered(reduceMotion)
    setPinCenter({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
    setOpenSpot(spot)
  }

  function showNotice(kind: AreaNoticeKind, title: string, note?: string) {
    toastSeq.current += 1
    setNotice({ id: toastSeq.current, kind, title, note })
  }

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function likeProfile() {
    const profile = openSpot?.profile
    if (!profile || busy || sent[profile.id] === 'like') return
    if (!isUnlimited && remaining <= 0) {
      showNotice('warn', 'Beğeni hakkın bitti', `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak`)
      return
    }
    setBusy(true)
    try {
      if (!(await tryConsumeLike())) {
        showNotice('warn', 'Beğeni hakkın bitti', `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak`)
        return
      }
      const uid = session?.uid
      if (uid && !isGameTestBotPlayerId(profile.id)) {
        const result = await sendLikeAndRefresh(uid, profile.id, 'discover')
        if (result.matched) {
          showNotice('match', 'Eşleşme!', `${profile.name} ile eşleştiniz`)
          setSent((current) => ({ ...current, [profile.id]: 'like' }))
          return
        }
      }
      setSent((current) => ({ ...current, [profile.id]: 'like' }))
      showNotice('like', 'Beğeni gönderildi', profile.name)
    } catch {
      showNotice('warn', 'Beğeni gönderilemedi', 'Bağlantını kontrol edip tekrar dene.')
    } finally {
      setBusy(false)
    }
  }

  function superLikeProfile() {
    const profile = openSpot?.profile
    if (!profile || busy || sent[profile.id] === 'super') return
    setSent((current) => ({ ...current, [profile.id]: 'super' }))
    showNotice('super', 'Premium beğeni gönderildi', `${profile.name} profiline öne çıktın`)
  }

  function playBurst(kind: AreaStampKind, after: () => void) {
    if (burst) return
    if (reduceMotion) {
      after()
      return
    }
    burstAfter.current = after
    setBurst(kind)
  }

  function onBurstDone() {
    const after = burstAfter.current
    burstAfter.current = null
    setBurst(null)
    after?.()
  }

  function closeProfile() {
    if (!openSpot) return
    if (reduceMotion) {
      setOpenSpot(null)
      setEntered(false)
      setClosing(false)
      return
    }
    setClosing(true)
  }

  function onProfileAnimationEnd(event: ReactAnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !closing) return
    setOpenSpot(null)
    setEntered(false)
    setClosing(false)
  }

  useEffect(() => {
    const radar = radarRef.current
    if (!radar) return
    const pins = () => radar.querySelectorAll<HTMLButtonElement>('.pm-area-map__pin')
    if (reduceMotion) {
      radar.style.setProperty('--sweep', '40deg')
      pins().forEach((pin) => pin.classList.add('is-found'))
      return
    }
    let frame = 0
    const period = 6800
    const onEnd = (event: AnimationEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (event.animationName !== 'pm-radar-ping') return
      target.classList.remove('is-hit')
    }
    radar.addEventListener('animationend', onEnd)
    const tick = (now: number) => {
      const deg = ((now % period) / period) * 360
      radar.style.setProperty('--sweep', `${deg}deg`)
      pins().forEach((pin) => {
        const bearing = Number(pin.dataset.bearing)
        let delta = Math.abs(deg - bearing)
        if (delta > 180) delta = 360 - delta
        if (delta < 16 && !pin.classList.contains('is-hit')) {
          pin.classList.add('is-hit', 'is-found')
        }
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      radar.removeEventListener('animationend', onEnd)
    }
  }, [reduceMotion, spots])

  return createPortal(
    <div className={`pm-area-map${openSpot ? ' is-profile' : ''}`} role="dialog" aria-modal="true" aria-label="Çevrende">
      <ShopGlassShader tone="violet" />
      <header className="pm-area-map__head">
        <div>
          <h2>Çevrende</h2>
          <p>Tam konum gizlidir. İnsanlar yalnızca çevrelerinde görünür.</p>
        </div>
        <button type="button" aria-label="Kapat" onClick={onClose}>
          <FiX />
        </button>
      </header>

      <div className="pm-area-map__stage">
        <div className={`pm-area-radar${reduceMotion ? ' is-still' : ''}`} ref={radarRef}>
          <div className="pm-area-radar__ticks" aria-hidden />
          <div className="pm-area-radar__beam" aria-hidden />
          {labels.map((label, index) => (
            <div key={label + index} className={`pm-area-radar__ring is-${index}`} aria-hidden />
          ))}
          <div className="pm-area-map__you">
            <i aria-hidden />
            <span>Sen</span>
          </div>
          {spots.map((spot) => (
            <PersonPin
              key={spot.id}
              spot={spot}
              selected={spot.id === openSpot?.id}
              onSelect={(pin) => openProfile(spot, pin)}
            />
          ))}
          {spots.length === 0 ? <p className="pm-area-map__empty">Bu çevrede kimse yok.</p> : null}
        </div>
      </div>

      <div className="pm-area-map__foot">
        <p>
          {spots.length} kişi bu çevrede
        </p>
        <div className="pm-area-map__radii" role="group" aria-label="Çevre yarıçapı">
          {RADII.map((value) => (
            <button
              key={value}
              type="button"
              className={value === radiusKm ? 'is-on' : ''}
              aria-pressed={value === radiusKm}
              onClick={() => {
                setRadiusKm(value)
                setOpenSpot(null)
                setEntered(false)
                setClosing(false)
              }}
            >
              {value} km
            </button>
          ))}
        </div>
        <p className="pm-area-map__hint">Birine dokun, profili açılsın.</p>
      </div>
      {openSpot ? (
        <div className="pm-area-profile">
          <button type="button" className="pm-area-profile__backdrop" aria-label="Profili kapat" onClick={closeProfile} />
          <div
            ref={sheetRef}
            className={`pm-area-profile__sheet${entered && !closing ? ' is-in' : ''}${closing ? ' is-out' : ''}`}
            style={{ transformOrigin: origin }}
            role="dialog"
            aria-modal="true"
            aria-label={openSpot.profile.name}
            onAnimationEnd={onProfileAnimationEnd}
          >
            <div className="pm-area-profile__frame">
              <MatchProfileCard profile={openSpot.profile} canAct={false} canLike={false} />
              {burst ? <AreaStamp kind={burst} onDone={onBurstDone} /> : null}
              <div className="pm-area-profile__actions">
                <button
                  type="button"
                  className="pm-area-emblem"
                  aria-label="Geç"
                  disabled={busy || Boolean(burst)}
                  onClick={() => playBurst('pass', closeProfile)}
                >
                  <img src={actionPass} alt="" />
                </button>
                <button
                  type="button"
                  className="pm-area-emblem"
                  aria-label={sent[openSpot.id] === 'like' ? 'Beğeni gönderildi' : 'Beğen'}
                  disabled={busy || Boolean(burst) || sent[openSpot.id] === 'like' || (!isUnlimited && remaining <= 0)}
                  onClick={() => {
                    if (!isUnlimited && remaining <= 0) {
                      showNotice('warn', 'Beğeni hakkın bitti', `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak`)
                      return
                    }
                    playBurst('like', () => {
                      void likeProfile()
                      closeProfile()
                    })
                  }}
                >
                  <img src={actionLike} alt="" />
                </button>
                <button
                  type="button"
                  className="pm-area-emblem"
                  aria-label={sent[openSpot.id] === 'super' ? 'Süper beğeni gönderildi' : 'Süper beğeni'}
                  disabled={busy || Boolean(burst) || sent[openSpot.id] === 'super'}
                  onClick={() =>
                    playBurst('super', () => {
                      superLikeProfile()
                      closeProfile()
                    })
                  }
                >
                  <img src={actionSuper} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <AreaNotice notice={notice} onDismiss={() => setNotice(null)} />
    </div>,
    document.body,
  )
}

function PersonPin({
  spot,
  selected,
  onSelect,
}: {
  spot: AreaSpot
  selected: boolean
  onSelect: (pin: HTMLButtonElement) => void
}) {
  return (
    <button
      type="button"
      className={`pm-area-map__pin${selected ? ' is-on' : ''}`}
      data-bearing={spot.bearing}
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      aria-label={`${spot.name}, ${spot.label}`}
      onClick={(event) => onSelect(event.currentTarget)}
    >
      <img src={spot.photo} alt="" draggable={false} style={{ objectPosition: spot.objectPosition }} />
      {spot.online ? <i /> : null}
    </button>
  )
}
