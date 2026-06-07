import '../../styles/match-bundle.css'
import { useState } from 'react'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import type { MatchTabId } from './data'
import { DAILY_LIKES_LIMIT } from './data'
import { MatchDiscoverDeck } from './components/MatchDiscoverDeck'
import { MatchFilterButton } from './components/MatchFilterButton'
import { MatchFiltersSheet } from './components/MatchFiltersSheet'
import { MatchTabs } from './components/MatchTabs'
import { MatchTitleBar } from './components/MatchTitleBar'
import { useMatchDiscover } from './useMatchDiscover'
import { useMatchFilters } from './useMatchFilters'

export function MatchScreen() {
  const [tab, setTab] = useState<MatchTabId>('discover')
  const filters = useMatchFilters()
  const { state: discoverState, actions: discoverActions } = useMatchDiscover(
    filters.applied.gender,
  )

  return (
    <div className="pm-app-shell pm-app-shell--match pm-shell-enter">
      <div className="pm-artboard pm-artboard-enter">
        <AmbientParticles />
        <main className="pm-match">
          <Navbar currencyVariant="match" />
          <div className="pm-match-top pm-match-top-enter">
            <MatchFilterButton onClick={filters.openSheet} />
            <MatchTitleBar />
          </div>
          <MatchTabs active={tab} onChange={setTab} />
          {tab === 'discover' ? (
            <MatchDiscoverDeck state={discoverState} actions={discoverActions} />
          ) : (
            <TabEmptyState tab={tab} />
          )}
        </main>
      </div>

      <MatchFiltersSheet
        open={filters.open}
        draft={filters.draft}
        onChange={filters.patchDraft}
        onApply={filters.applyDraft}
        onReset={filters.resetDraft}
        onClose={filters.closeSheet}
      />
    </div>
  )
}

function TabEmptyState({ tab }: { tab: Exclude<MatchTabId, 'discover'> }) {
  const title = tab === 'likers' ? 'Beğenenler' : 'Eşleşmelerim'
  return (
    <div className="pm-match-empty pm-match-empty-enter">
      <p className="pm-match-empty__title">{title}</p>
      <p className="pm-match-empty__text">
        Bu sekme için liste yakında eklenecek. Keşfet ile eşleşmeye devam et — günlük{' '}
        {DAILY_LIKES_LIMIT} beğeni hakkın var.
      </p>
    </div>
  )
}
