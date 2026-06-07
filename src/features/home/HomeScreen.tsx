import '../../styles/home-bundle.css'
import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown, FiMapPin, FiSliders } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { FilterBar } from './components/FilterBar'
import { HeroDiscoveryStack } from './components/HeroDiscoveryStack'
import { HomeFiltersSheet } from './components/HomeFiltersSheet'
import { LiveSocialStrip } from './components/LiveSocialStrip'
import { Navbar } from './components/Navbar'
import { NearbyPlayersRow } from './components/NearbyPlayersRow'
import { PremiumUnlockCard } from './components/PremiumUnlockCard'
import { buildFilterChips } from './buildFilterChips'
import { filterNearbyPlayers } from './filterDiscovery'
import { nearbyListLiveCaption, nearbyPlayers } from './data'
import { useHomeFilters } from './useHomeFilters'
import { useHomeScrollEnd } from './useHomeScrollEnd'
import { useLiveSocialStats } from './useLiveSocialStats'

export function HomeScreen() {
  useHomeScrollEnd()
  const navigate = useNavigate()
  const live = useLiveSocialStats()
  const {
    applied,
    draft,
    open: filtersOpen,
    openSheet,
    closeSheet,
    patchDraft,
    applyDraft,
    resetDraft,
    toggleOnlineQuick,
  } = useHomeFilters()

  const filterChips = useMemo(() => buildFilterChips(applied), [applied])
  const visibleNearby = useMemo(
    () => filterNearbyPlayers(nearbyPlayers, applied),
    [applied],
  )

  const filtersPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <HomeFiltersSheet
            open={filtersOpen}
            draft={draft}
            onChange={patchDraft}
            onApply={applyDraft}
            onReset={resetDraft}
            onClose={closeSheet}
          />,
          document.body,
        )
      : null

  return (
    <div className="pm-app-shell pm-app-shell--home">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-home">
          <Navbar />

          <section className="pm-location">
            <div className="pm-location__head">
              <div>
                <h1>
                  <FiMapPin /> Yakındaki Oyuncular
                </h1>
                <button type="button">
                  İstanbul, Türkiye <FiChevronDown />
                </button>
              </div>
              <button className="pm-filter-large" type="button" onClick={openSheet}>
                Filtrele
                <FiSliders />
              </button>
            </div>
          </section>

          <LiveSocialStrip
            activePlayersLabel={live.activePlayersLabel}
            waitLabel={live.waitLabel}
            tickerLine={live.tickerLine}
            activeFlash={live.activeFlash}
            waitFlash={live.waitFlash}
            waitPulseFast={live.waitPulseFast}
          />

          <FilterBar filters={filterChips} onToggleOnline={toggleOnlineQuick} />

          <HeroDiscoveryStack />

          <div className="pm-carousel-dots">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>

          <section className="pm-nearby-list">
            <header>
              <div>
                <h3>
                  <FiMapPin /> Yakınındaki Diğer Oyuncular
                </h3>
                {nearbyListLiveCaption.sectionEyebrow ? (
                  <p className="pm-nearby-list__eyebrow">{nearbyListLiveCaption.sectionEyebrow}</p>
                ) : null}
              </div>
              <button type="button" onClick={() => navigate('/nearby')}>
                Tümünü Gör
              </button>
            </header>

            <NearbyPlayersRow players={visibleNearby} />
          </section>

          <PremiumUnlockCard />
        </main>
      </div>
      {filtersPortal}
    </div>
  )
}
