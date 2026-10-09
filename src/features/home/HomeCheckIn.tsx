import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiNavigation, FiX } from 'react-icons/fi'
import { useAuthSession } from '../auth/useAuthSession'
import { TURKEY_PROVINCES } from './turkeyPlaces'
import { CheckInFeed } from './CheckInFeed'
import { CheckInShader } from './CheckInShader'
import { checkInPlaceLabel, districtPlace, findCheckInPlace, type CheckInPlace } from './checkInPlaces'
import {
  getVenuePresenceServerSnapshot,
  getVenuePresenceSnapshot,
  subscribeVenuePresence,
} from './checkInPresence'
import { subscribePeopleHere, type HerePerson } from './firestoreCheckIn'
import { checkInAt, getCheckInCheckedInAt, getCheckInSnapshot, leaveCheckIn, subscribeCheckIn } from './checkInStore'

export function useCheckedInPlace(): CheckInPlace | null {
  const id = useSyncExternalStore(subscribeCheckIn, getCheckInSnapshot, () => null)
  return findCheckInPlace(id)
}

function fold(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
}

function includesText(value: string, query: string) {
  return fold(value).includes(query)
}

export function HomeCheckIn() {
  const place = useCheckedInPlace()
  const presence = useSyncExternalStore(
    subscribeVenuePresence,
    getVenuePresenceSnapshot,
    getVenuePresenceServerSnapshot,
  )
  const othersHere =
    place && presence.ready && presence.placeId === place.id ? presence.people.length : 0
  const { session } = useAuthSession()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [picked, setPicked] = useState<{ city: string; district: string } | null>(null)
  const [preview, setPreview] = useState<HerePerson[]>([])

  const normalized = fold(query.trim())
  const province = TURKEY_PROVINCES.find((item) => item.name === city) ?? null

  const provinces = useMemo(() => {
    if (!normalized) return TURKEY_PROVINCES
    return TURKEY_PROVINCES.filter(
      (item) =>
        includesText(item.name, normalized) || item.districts.some((name) => includesText(name, normalized)),
    )
  }, [normalized])

  const districts = useMemo(() => {
    if (!province) return []
    if (!normalized) return province.districts
    return province.districts.filter((name) => includesText(name, normalized))
  }, [province, normalized])

  const districtHits = useMemo(() => {
    if (!normalized || city) return []
    const hits: { city: string; district: string }[] = []
    for (const item of TURKEY_PROVINCES) {
      if (includesText(item.name, normalized)) continue
      for (const name of item.districts) {
        if (!includesText(name, normalized)) continue
        hits.push({ city: item.name, district: name })
        if (hits.length >= 30) return hits
      }
    }
    return hits
  }, [normalized, city])

  useEffect(() => {
    if (!open || !picked) {
      setPreview([])
      return
    }
    const next = districtPlace(picked.city, picked.district)
    if (!next) return
    return subscribePeopleHere(next.id, session?.uid ?? null, setPreview)
  }, [open, picked, session?.uid])

  function close() {
    setOpen(false)
    setQuery('')
    setCity(null)
    setPicked(null)
  }

  function confirmCheckIn() {
    if (!picked) return
    const next = districtPlace(picked.city, picked.district)
    if (!next) return
    if (place?.id !== next.id) checkInAt(next)
    close()
  }

  return (
    <>
      <div className="pm-checkin">
        <button type="button" className="pm-checkin__bar" onClick={() => setOpen(true)}>
          <span className="pm-checkin__mark" aria-hidden>
            <FiNavigation />
          </span>
          <span className="pm-checkin__copy">
            <strong>{place ? checkInPlaceLabel(place) : 'Check-in yap'}</strong>
            <small>
              {place
                ? othersHere > 0
                  ? `${othersHere} kişi burada`
                  : '3 saat görünürsün'
                : 'İlçendeki kişilerle tanış'}
            </small>
          </span>
          <FiChevronRight className="pm-checkin__go" aria-hidden />
        </button>
        {place ? (
          <button type="button" className="pm-checkin__leave" onClick={leaveCheckIn}>
            Ayrıl
          </button>
        ) : null}
      </div>

      {open
        ? createPortal(
            <>
              <button type="button" className="pm-checkin__backdrop" aria-label="Kapat" onClick={close} />
              <section className="pm-checkin__sheet" role="dialog" aria-modal="true" aria-label="Check-in">
                <CheckInShader />
                <header className="pm-checkin__head">
                  <div>
                    <h2>{picked ? picked.district : (city ?? 'Check-in')}</h2>
                    <p>
                      {picked
                        ? 'En son check-in yapan üstte. Aşağıya doğru eskiler.'
                        : city
                          ? 'Bir ilçe seç, oradaki kişilerle tanış'
                          : 'İlçe seç, oradaki kişilerle tanış. 3 saat görünürsün.'}
                    </p>
                  </div>
                  <button type="button" aria-label="Kapat" onClick={close}>
                    <FiX />
                  </button>
                </header>

                {picked || city ? (
                  <button
                    type="button"
                    className="pm-checkin__back"
                    onClick={() => {
                      if (picked) {
                        setPicked(null)
                        return
                      }
                      setCity(null)
                    }}
                  >
                    <FiChevronLeft aria-hidden />
                    {picked ? picked.city : 'İller'}
                  </button>
                ) : null}

                {picked ? null : (
                  <input
                    className="pm-checkin__search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={city ? 'İlçe ara' : 'İl veya ilçe ara'}
                  />
                )}

                {picked ? (
                  <>
                    <CheckInFeed
                      people={preview}
                      youAt={
                        place?.city === picked.city && place.district === picked.district
                          ? getCheckInCheckedInAt()
                          : null
                      }
                    />
                    <div className="pm-checkin__confirm">
                      <p>
                        {place?.city === picked.city && place.district === picked.district
                          ? `${picked.district} check-in’in duruyor. Tamam deyince bu ekrandan çıkarsın.`
                          : `${picked.district}, ${picked.city} için check-in yapılsın mı?`}
                      </p>
                      <div>
                        <button type="button" className="is-ghost" onClick={() => setPicked(null)}>
                          Vazgeç
                        </button>
                        <button type="button" onClick={confirmCheckIn}>
                          Tamam
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {picked ? null : (
                <div className="pm-checkin__list">
                  {districtHits.length > 0 ? (
                    <section>
                      <h3>İlçeler</h3>
                      {districtHits.map((item) => (
                        <button
                          key={`${item.city}-${item.district}`}
                          type="button"
                          className={place?.city === item.city && place.district === item.district ? 'is-current' : ''}
                          onClick={() => setPicked({ city: item.city, district: item.district })}
                        >
                          <span>
                            {item.district}
                            <small>{item.city}</small>
                          </span>
                        </button>
                      ))}
                    </section>
                  ) : null}

                  {city ? (
                    <section>
                      <h3>{city} ilçeleri</h3>
                      {districts.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className={place?.city === city && place.district === name ? 'is-current' : ''}
                          onClick={() => setPicked({ city, district: name })}
                        >
                          {name}
                        </button>
                      ))}
                    </section>
                  ) : (
                    <section>
                      <h3>İller</h3>
                      {provinces.map((item) => (
                        <button key={item.name} type="button" onClick={() => setCity(item.name)}>
                          <span>
                            {item.name}
                            <small>Türkiye</small>
                          </span>
                        </button>
                      ))}
                    </section>
                  )}
                </div>
                )}
              </section>
            </>,
            document.body,
          )
        : null}
    </>
  )
}
