import { useState, useSyncExternalStore } from 'react'
import barArt from './assets/cevrende-bar-base.png'
import pinArt from './assets/cevrende-pin-cut.png'
import { CheckInWaveShader } from './CheckInWaveShader'
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
        <button
          type="button"
          className="pm-checkin__bar pm-checkin__bar--frame"
          onClick={() => setOpen(true)}
          aria-label={
            place
              ? `Çevrende, ${checkInPlaceLabel(place)}`
              : 'Çevrende, yakınındaki insanlar'
          }
        >
          <span className="pm-checkin__sheen" aria-hidden />
          <span className="pm-checkin__stage">
            <img
              className="pm-checkin__art"
              src={barArt}
              alt=""
              width={1013}
              height={245}
              draggable={false}
            />
            <CheckInWaveShader />
            <span className="pm-checkin__pin-shadow" aria-hidden />
            <img className="pm-checkin__pin" src={pinArt} alt="" draggable={false} />
          </span>
          {place ? (
            <span className="pm-checkin__place" aria-hidden>
              {checkInPlaceLabel(place)}
            </span>
          ) : null}
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
