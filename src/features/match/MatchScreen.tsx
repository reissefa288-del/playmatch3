import { useState } from 'react'
import { MatchScreenBody } from './MatchScreenBody'
import { MatchScreenShell } from './MatchScreenShell'
import type { MatchTabId } from './data'
import { useMatchFilters } from './useMatchFilters'

/** Sync shell + body — instant discover deck */
export function MatchScreen() {
  const [tab, setTab] = useState<MatchTabId>('discover')
  const filters = useMatchFilters()

  return (
    <div className="pm-app-shell pm-app-shell--match">
      <div className="pm-artboard">
        <main className="pm-match">
          <MatchScreenShell tab={tab} onTabChange={setTab} filters={filters} />
          <MatchScreenBody tab={tab} filters={filters} />
        </main>
      </div>
    </div>
  )
}
