import type { MatchTabId } from '../data'
import { matchTabs } from '../data'
import { useMatchConnections } from '../useMatchConnections'

type MatchTabsProps = {
  active: MatchTabId
  onChange: (id: MatchTabId) => void
}

export function MatchTabs({ active, onChange }: MatchTabsProps) {
  const { matchCount } = useMatchConnections()

  return (
    <div
      className="pm-match-tabs"
      role="tablist"
      aria-label="Eşleşme sekmeleri"
     
     
     
    >
      {matchTabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`pm-match-tabs__btn${isActive ? ' is-active' : ''}`}
          >
            <span className="pm-match-tabs__label">{tab.label}</span>
            {tab.id === 'matches' && matchCount > 0 ? (
              <span className="pm-match-tabs__badge">{matchCount}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
