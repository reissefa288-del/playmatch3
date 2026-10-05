import { FiMapPin, FiX } from 'react-icons/fi'
import type { NearbyPlayer } from '../types'
import { NearbyPlayerListCard } from './NearbyPlayerListCard'

type NearbyPlayersSheetProps = {
  open: boolean
  players: NearbyPlayer[]
  liveCaption?: string
  onClose: () => void
}

export function NearbyPlayersSheet({
  open,
  players,
  liveCaption,
  onClose,
}: NearbyPlayersSheetProps) {

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            className="pm-nearby-sheet__backdrop"
            aria-label="Kapat"
           
           
           
            onClick={onClose}
          />
          <section
            className="pm-nearby-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-nearby-sheet-title"
            style={{ x: '-50%', y: '-50%' }}
           
           
           
           
          >
            <header className="pm-nearby-sheet__head">
              <div>
                <h2 id="pm-nearby-sheet-title">
                  <FiMapPin aria-hidden /> Yakındaki Oyuncular
                </h2>
                {liveCaption ? <p>{liveCaption}</p> : null}
              </div>
              <button type="button" className="pm-nearby-sheet__close" onClick={onClose} aria-label="Kapat">
                <FiX />
              </button>
            </header>

            <ul className="pm-nearby-sheet__list">
              {players.map((player) => (
                <li key={player.id}>
                  <NearbyPlayerListCard player={player} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </>
  )
}
