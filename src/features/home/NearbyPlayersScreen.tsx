import '../../styles/home-nearby-screen.css'
import { FiArrowLeft, FiMapPin } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { Navbar } from './components/Navbar'
import { NearbyEmptyState } from './components/NearbyEmptyState'
import { NearbyPlayersList } from './components/NearbyPlayersList'
import { LocationConsentSheet } from '../location/components/LocationConsentSheet'
import { useHomeFilters } from './useHomeFilters'
import { useNearbyPlayers } from './useNearbyPlayers'

export function NearbyPlayersScreen() {
  const navigate = useNavigate()
  const { applied } = useHomeFilters()
  const { players: visibleNearby, needsLocation, location } = useNearbyPlayers(applied)

  return (
    <div className="pm-app-shell pm-app-shell--nearby">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-nearby-screen">
          <Navbar />

          <header className="pm-nearby-screen__hero">
            <button
              type="button"
              className="pm-nearby-screen__back"
              onClick={() => navigate('/', { replace: true })}
              aria-label="Ana sayfaya dön"
            >
              <span className="pm-nearby-screen__back-icon" aria-hidden>
                <FiArrowLeft />
              </span>
              <span className="pm-nearby-screen__back-label">Geri</span>
            </button>

            <h1 className="pm-nearby-screen__title">
              <FiMapPin aria-hidden /> Yakındaki Oyuncular
            </h1>
          </header>

          {visibleNearby.length === 0 ? (
            <NearbyEmptyState
              needsLocation={needsLocation}
              onEnableLocation={location.openConsent}
            />
          ) : (
            <NearbyPlayersList players={visibleNearby} />
          )}
        </main>
      </div>

      <LocationConsentSheet
        open={location.consentOpen}
        loading={location.loading}
        error={location.error}
        onAccept={() => void location.enableSharing()}
        onDecline={location.closeConsent}
      />
    </div>
  )
}
