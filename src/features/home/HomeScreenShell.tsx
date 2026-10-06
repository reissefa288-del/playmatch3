import '../../styles/home-hero.css'
import { useMemo } from 'react'
import { FiSliders } from 'react-icons/fi'
import { FilterBar } from './components/FilterBar'
import { Navbar } from './components/Navbar'
import { buildFilterChips } from './buildFilterChips'
import type { HomeFiltersController } from './useHomeFilters'

type HomeScreenShellProps = {
  filters: HomeFiltersController
}

/** P7 — sync shell: top chrome; discovery stack defers to body */
export function HomeScreenShell({ filters }: HomeScreenShellProps) {
  const { applied, openSheet, toggleOnlineQuick } = filters
  const filterChips = useMemo(() => buildFilterChips(applied), [applied])

  return (
    <>
      <Navbar />

      <section className="pm-location">
        <div className="pm-location__head">
          <h1>Yakındaki Oyuncular</h1>
          <button className="pm-filter-large" type="button" onClick={openSheet}>
            Filtrele
            <FiSliders />
          </button>
        </div>
      </section>

      <FilterBar filters={filterChips} onToggleOnline={toggleOnlineQuick} />
    </>
  )
}
