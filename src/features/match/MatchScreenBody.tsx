import '../../styles/match-bundle.css'
import { lazy, Suspense } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { type MatchTabId } from './data'
import { MatchDiscoverDeck } from './components/MatchDiscoverDeck'
import { MatchMatchesList } from './components/MatchMatchesList'
import { useMatchConnections } from './useMatchConnections'
import { useMatchDiscover } from './useMatchDiscover'
import type { useMatchFilters } from './useMatchFilters'

const MatchFiltersSheet = lazy(() =>
  import('./components/MatchFiltersSheet').then((module) => ({ default: module.MatchFiltersSheet })),
)

type MatchFiltersController = ReturnType<typeof useMatchFilters>

type MatchScreenBodyProps = {
  tab: MatchTabId
  filters: MatchFiltersController
}

/** Discover deck + matches — no deferred gate */
export function MatchScreenBody({ tab, filters }: MatchScreenBodyProps) {
  const { state: discoverState, actions: discoverActions } = useMatchDiscover(
    filters.applied.gender,
  )
  const { matches, loading: matchesLoading } = useMatchConnections()

  return (
    <>
      <AmbientParticles />
      {tab === 'discover' ? (
        <MatchDiscoverDeck state={discoverState} actions={discoverActions} />
      ) : (
        <MatchMatchesList matches={matches} loading={matchesLoading} />
      )}

      {filters.open ? (
        <Suspense fallback={null}>
          <MatchFiltersSheet
            open={filters.open}
            draft={filters.draft}
            onChange={filters.patchDraft}
            onApply={filters.applyDraft}
            onReset={filters.resetDraft}
            onClose={filters.closeSheet}
          />
        </Suspense>
      ) : null}
    </>
  )
}
