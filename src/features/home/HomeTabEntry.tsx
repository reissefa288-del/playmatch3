import { HomeScreenBody } from './HomeScreenBody'
import { HomeScreenShell } from './HomeScreenShell'
import { useHomeFilters } from './useHomeFilters'

/** Sync shell + body — no lazy, no idle, no interactive gate */
export function HomeTabEntry() {
  const filters = useHomeFilters()

  return (
    <div className="pm-app-shell pm-app-shell--home">
      <div className="pm-artboard">
        <main className="pm-home pm-home--interactive">
          <HomeScreenShell filters={filters} />
          <HomeScreenBody filters={filters} />
        </main>
      </div>
    </div>
  )
}

/** @deprecated use HomeTabEntry */
export { HomeTabEntry as HomeScreen }
