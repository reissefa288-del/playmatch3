import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import gamesReference from '../../reference/games-final.png'
import { CategoryTabs } from './components/CategoryTabs'
import { FeaturedGamesRow } from './components/FeaturedGamesRow'
import { GamesHeader } from './components/GamesHeader'
import { PopularGamesGrid } from './components/PopularGamesGrid'
import { featuredGames, gamesCategories, gamesGrid } from './data'

export function GamesScreen() {
  const gamesVars = {
    '--pm-games-reference': `url(${gamesReference})`,
  } as CSSProperties

  return (
    <div className="pm-app-shell pm-app-shell--games" style={gamesVars}>
      <motion.div className="pm-artboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AmbientParticles />
        <main className="pm-games">
          <Navbar />
          <GamesHeader />
          <CategoryTabs categories={gamesCategories} />
          <FeaturedGamesRow games={featuredGames} />
          <PopularGamesGrid games={gamesGrid} />
        </main>
      </motion.div>
    </div>
  )
}
