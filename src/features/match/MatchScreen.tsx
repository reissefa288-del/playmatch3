import { useState } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { HomeFiltersSheet } from '../home/components/HomeFiltersSheet'
import { Navbar } from '../home/components/Navbar'
import { useHomeFilters } from '../home/useHomeFilters'
import type { MatchTabId } from './data'
import { DAILY_LIKES_LIMIT } from './data'
import { MatchDiscoverDeck } from './components/MatchDiscoverDeck'
import { MatchFilterButton } from './components/MatchFilterButton'
import { MatchTabs } from './components/MatchTabs'
import { MatchTitleBar } from './components/MatchTitleBar'
import { useMatchDiscover } from './useMatchDiscover'

export function MatchScreen() {
  const [tab, setTab] = useState<MatchTabId>('discover')
  const filters = useHomeFilters()
  const discover = useMatchDiscover()

  return (
    <motion.div
      className="pm-app-shell pm-app-shell--match"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="pm-artboard"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AmbientParticles />
        <main className="pm-match">
          <Navbar currencyVariant="match" />
          <motion.div
            className="pm-match-top"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <MatchFilterButton onClick={filters.openSheet} />
            <MatchTitleBar />
          </motion.div>
          <MatchTabs active={tab} onChange={setTab} />
          {tab === 'discover' ? (
            <MatchDiscoverDeck discover={discover} />
          ) : (
            <TabEmptyState tab={tab} />
          )}
        </main>
      </motion.div>

      <HomeFiltersSheet
        open={filters.open}
        draft={filters.draft}
        onChange={filters.patchDraft}
        onApply={filters.applyDraft}
        onReset={filters.resetDraft}
        onClose={filters.closeSheet}
      />
    </motion.div>
  )
}

function TabEmptyState({ tab }: { tab: Exclude<MatchTabId, 'discover'> }) {
  const title = tab === 'likers' ? 'Beğenenler' : 'Eşleşmelerim'
  return (
    <motion.div
      className="pm-match-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="pm-match-empty__title">{title}</p>
      <p className="pm-match-empty__text">
        Bu sekme için liste yakında eklenecek. Keşfet ile eşleşmeye devam et — günlük{' '}
        {DAILY_LIKES_LIMIT} beğeni hakkın var.
      </p>
    </motion.div>
  )
}
