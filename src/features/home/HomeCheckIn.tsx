import { useState, useSyncExternalStore } from 'react'
import { FiChevronRight, FiMap } from 'react-icons/fi'
import { AreaMapScreen } from './areaMap/AreaMapScreen'
import { checkInPlaceLabel, findCheckInPlace, type CheckInPlace } from './checkInPlaces'
import { getCheckInSnapshot, leaveCheckIn, subscribeCheckIn } from './checkInStore'

export function useCheckedInPlace(): CheckInPlace | null {
  const id = useSyncExternalStore(subscribeCheckIn, getCheckInSnapshot, () => null)
  return findCheckInPlace(id)
}

export function HomeCheckIn() {
  const place = useCheckedInPlace()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="pm-checkin">
        <button type="button" className="pm-checkin__bar" onClick={() => setOpen(true)}>
          <span className="pm-checkin__mark" aria-hidden>
            <FiMap />
          </span>
          <span className="pm-checkin__copy">
            <strong>Çevrende</strong>
            <small>{place ? checkInPlaceLabel(place) : 'Yakınındaki insanlar'}</small>
          </span>
          <FiChevronRight className="pm-checkin__go" aria-hidden />
        </button>
        {place ? (
          <button type="button" className="pm-checkin__leave" onClick={leaveCheckIn}>
            Ayrıl
          </button>
        ) : null}
      </div>
      {open ? <AreaMapScreen onClose={() => setOpen(false)} /> : null}
    </>
  )
}
