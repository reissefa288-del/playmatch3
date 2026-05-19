import { useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import type { MatchTabId } from './data'
import { MatchActionRow } from './components/MatchActionRow'
import { MatchBoostPanel } from './components/MatchBoostPanel'
import { MatchProfileCard } from './components/MatchProfileCard'
import { MatchTabs } from './components/MatchTabs'
import { MatchTitleBar } from './components/MatchTitleBar'
import matchPortrait from '../../reference/match-final.png'

export function MatchScreen() {
  const [tab, setTab] = useState<MatchTabId>('discover')

  const matchVars = {
    '--pm-match-portrait': `url(${matchPortrait})`,
  } as CSSProperties

  return (
    <div className="pm-app-shell pm-app-shell--match">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-match flex flex-col gap-5" style={matchVars}>
          <Navbar />
          <MatchTitleBar />
          <MatchTabs active={tab} onChange={setTab} />
          {tab === 'discover' ? (
            <>
              <MatchProfileCard portraitUrl={matchPortrait} />
              <MatchActionRow />
              <MatchBoostPanel />
            </>
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
      className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[rgba(140,160,255,0.2)] bg-[rgba(8,10,32,0.55)] px-4 py-12 text-center shadow-[0_0_40px_rgba(80,100,200,0.08)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-base font-bold tracking-tight text-white drop-shadow-[0_0_16px_rgba(255,100,200,0.2)]">
        {title}
      </p>
      <p className="mt-2 max-w-[260px] text-[0.8125rem] leading-relaxed text-[#9aa8d8]">
        Bu sekme için liste yakında eklenecek. Keşfet ile eşleşmeye devam et.
      </p>
    </motion.div>
  )
}
