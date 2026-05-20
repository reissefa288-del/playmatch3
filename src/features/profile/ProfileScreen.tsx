import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import {
  profileAchievements,
  profileAchievementMore,
  profileFavoriteGames,
  profileRecentActivity,
  profileStats,
} from './data'
import { AchievementsRow } from './components/AchievementsRow'
import { FavoriteGamesRow } from './components/FavoriteGamesRow'
import { ProfileHero } from './components/ProfileHero'
import { ProfileStats } from './components/ProfileStats'
import { RecentActivityList } from './components/RecentActivityList'
import profileReference from '../../reference/profile-final.png'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'

export function ProfileScreen() {
  const profileVars = {
    '--pm-profile-reference': `url(${profileReference})`,
  } as CSSProperties

  return (
    <motion.div
      className="pm-app-shell pm-app-shell--profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-profile" style={profileVars}>
          <Navbar />
          <ProfileHero portraitUrl={FAKE_PORTRAIT_MALE} />
          <FavoriteGamesRow games={profileFavoriteGames} />
          <ProfileStats stats={profileStats} />
          <AchievementsRow achievements={profileAchievements} moreCount={profileAchievementMore} />
          <RecentActivityList activities={profileRecentActivity} />
        </main>
      </motion.div>
    </motion.div>
  )
}
