import { motion } from 'framer-motion'
import type { MatchTabId } from '../data'
import { matchTabs } from '../data'

type MatchTabsProps = {
  active: MatchTabId
  onChange: (id: MatchTabId) => void
}

export function MatchTabs({ active, onChange }: MatchTabsProps) {
  return (
    <motion.div
      className="pm-match-tabs"
      role="tablist"
      aria-label="Eşleşme sekmeleri"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.4 }}
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
            {tab.badge != null ? (
              <span className="pm-match-tabs__badge">{tab.badge}</span>
            ) : null}
          </button>
        )
      })}
    </motion.div>
  )
}
