import '../../styles/home-hero.css'
import { useMemo } from 'react'
import nearbyTitle from './assets/nearby-title.png'
import { FilterBar } from './components/FilterBar'
import { Navbar } from './components/Navbar'
import { buildFilterChips } from './buildFilterChips'
import type { HomeFiltersController } from './useHomeFilters'

type HomeScreenShellProps = {
  filters: HomeFiltersController
}

/** P7 — sync shell: top chrome; discovery stack defers to body */
export function HomeScreenShell({ filters }: HomeScreenShellProps) {
  const { applied, toggleOnlineQuick } = filters
  const filterChips = useMemo(() => buildFilterChips(applied), [applied])

  return (
    <>
      <Navbar />

      <section className="pm-location">
        <div className="pm-location__head">
          <h1 className="pm-location__title-text">Yakındaki Oyuncular</h1>
          <img className="pm-location__cut" src={nearbyTitle} alt="" />
        </div>
      </section>

      <FilterBar
        filters={filterChips}
        distanceKm={applied.maxDistanceKm}
        gender={applied.gender}
        onToggleOnline={toggleOnlineQuick}
        onDistance={(maxDistanceKm) => filters.applyQuick({ maxDistanceKm })}
        onGender={(gender) => filters.applyQuick({ gender })}
      />
    </>
  )
}
