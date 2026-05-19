import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown, FiMapPin, FiSliders } from 'react-icons/fi'
import homeReference from '../../reference/home-final.png'
import { AmbientParticles } from './components/AmbientParticles'
import { FilterBar } from './components/FilterBar'
import { HeroDiscoveryStack } from './components/HeroDiscoveryStack'
import { HomeFiltersSheet } from './components/HomeFiltersSheet'
import { LiveSocialStrip } from './components/LiveSocialStrip'
import { Navbar } from './components/Navbar'
import { NearbyPlayerCard } from './components/NearbyPlayerCard'
import { QuestCard } from './components/QuestCard'
import { QuickStartSection } from './components/QuickStartSection'
import { buildFilterChips } from './buildFilterChips'
import { filterNearbyPlayers } from './filterDiscovery'
import { nearbyPlayers, questMeta, quickStartActions } from './data'
import { useHomeFilters } from './useHomeFilters'
import { useLiveSocialStats } from './useLiveSocialStats'

export function HomeScreen() {
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
    <div className="pm-app-shell">
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

          <HeroDiscoveryStack portraitImage={homeReference} />

          <div className="pm-carousel-dots">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>

          <section className="pm-nearby-list">
            <header>
              <h3>
                <FiMapPin /> Yakınındaki Diğer Oyuncular
              </h3>
              <button type="button">Tümünü Gör</button>
            </header>

            <div className="pm-nearby-list__scroll">
              {visibleNearby.map((player) => (
                <NearbyPlayerCard key={player.id} player={player} portraitImage={homeReference} />
              ))}
            </div>
          </section>

          <QuestCard {...questMeta} />
          <QuickStartSection actions={quickStartActions} />
        </main>
      </div>
      {filtersPortal}
    </div>
  )
}
