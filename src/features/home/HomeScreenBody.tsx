import '../../styles/home-body.css'
import { lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { FiMapPin } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { HomeDiscoverSection } from './components/HomeDiscoverSection'
import { NearbyEmptyState } from './components/NearbyEmptyState'
import { NearbyPlayersRow } from './components/NearbyPlayersRow'
import { PremiumUnlockCard } from './components/PremiumUnlockCard'
import { useNearbyPlayers } from './useNearbyPlayers'
import type { HomeFiltersController } from './useHomeFilters'
import { useHomeScrollEnd } from './useHomeScrollEnd'
import { LocationConsentSheet } from '../location/components/LocationConsentSheet'

const HomeFiltersSheet = lazy(() =>
  import('./components/HomeFiltersSheet').then((module) => ({ default: module.HomeFiltersSheet })),
)

type HomeScreenBodyProps = {
  filters: HomeFiltersController
}

/** Full home content — no deferred interactive gate */
export function HomeScreenBody({ filters }: HomeScreenBodyProps) {
  useHomeScrollEnd()
  const navigate = useNavigate()
  const { applied, draft, open: filtersOpen, closeSheet, patchDraft, applyDraft, resetDraft } = filters
  const { players: visibleNearby, needsLocation, location } = useNearbyPlayers(applied)

  const filtersPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <Suspense fallback={null}>
            <HomeFiltersSheet
              open={filtersOpen}
              draft={draft}
              onChange={patchDraft}
              onApply={applyDraft}
              onReset={resetDraft}
              onClose={closeSheet}
            />
          </Suspense>,
          document.body,
        )
      : null

  return (
    <>
      <AmbientParticles />

      <HomeDiscoverSection filters={applied} />

      <section className="pm-nearby-list">
        <header>
          <div>
            <h3>
              <FiMapPin /> Yakınındaki Diğer Oyuncular
            </h3>
          </div>
          <button type="button" onClick={() => navigate('/nearby')}>
            Tümünü Gör
          </button>
        </header>
        {visibleNearby.length === 0 ? (
          <NearbyEmptyState
            needsLocation={needsLocation}
            onEnableLocation={location.openConsent}
          />
        ) : (
          <NearbyPlayersRow players={visibleNearby} />
        )}
      </section>

      <LocationConsentSheet
        open={location.consentOpen}
        loading={location.loading}
        error={location.error}
        onAccept={() => void location.enableSharing()}
        onDecline={location.closeConsent}
      />

      <PremiumUnlockCard />

      {filtersPortal}
    </>
  )
}
