import '../../styles/match-bundle.css'
import { Navbar } from '../home/components/Navbar'
import { type MatchTabId } from './data'
import { MatchFilterButton } from './components/MatchFilterButton'
import { MatchTabs } from './components/MatchTabs'
import { MatchTitleBar } from './components/MatchTitleBar'
import type { useMatchFilters } from './useMatchFilters'

type MatchFiltersController = ReturnType<typeof useMatchFilters>

type MatchScreenShellProps = {
  tab: MatchTabId
  onTabChange: (tab: MatchTabId) => void
  filters: MatchFiltersController
}

/** P8 — sync shell: top chrome; deck/actions defer to body */
export function MatchScreenShell({ tab, onTabChange, filters }: MatchScreenShellProps) {
  return (
    <>
      <Navbar currencyVariant="match" />
      <div className="pm-match-top pm-match-top-enter">
        <MatchFilterButton onClick={filters.openSheet} />
        <MatchTitleBar />
      </div>
      <MatchTabs active={tab} onChange={onTabChange} />
    </>
  )
}
