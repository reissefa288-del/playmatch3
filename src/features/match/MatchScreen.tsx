import { useState } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import type { MatchTabId } from './data'
import { MatchActionRow } from './components/MatchActionRow'
import { MatchBoostPanel } from './components/MatchBoostPanel'
import { MatchProfileCard } from './components/MatchProfileCard'
import { MatchTabs } from './components/MatchTabs'
import { MatchTitleBar } from './components/MatchTitleBar'
import portraitReference from '../../reference/home-final.png'

export function MatchScreen() {
  const [tab, setTab] = useState<MatchTabId>('discover')

  return (
    <div className="pm-app-shell pm-app-shell--match">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-match">
          <Navbar currencyVariant="match" />
          <MatchTitleBar />
          <MatchTabs active={tab} onChange={setTab} />
          {tab === 'discover' ? (
            <div className="pm-match-discover">
              <MatchProfileCard portraitUrl={portraitReference} />
              <MatchActionRow />
              <MatchBoostPanel />
            </div>
          ) : (
            <TabEmptyState tab={tab} />
          )}
        </main>
      </div>
    </div>
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
        Bu sekme için liste yakında eklenecek. Keşfet ile eşleşmeye devam et.
      </p>
    </motion.div>
  )
}
