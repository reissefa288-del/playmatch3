import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { premiumFeatures, premiumPackages } from './data'
import { PremiumFeaturesGrid } from './components/PremiumFeaturesGrid'
import { PremiumHero } from './components/PremiumHero'
import { PremiumPackages } from './components/PremiumPackages'
import { PremiumTitleBar } from './components/PremiumTitleBar'
import premiumReference from '../../reference/premium-final.png'

export function PremiumScreen() {
  const premiumVars = {
    '--pm-premium-reference': `url(${premiumReference})`,
  } as CSSProperties

  return (
    <motion.div
      className="pm-app-shell pm-app-shell--premium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-premium" style={premiumVars}>
          <Navbar />
          <PremiumTitleBar />
          <PremiumHero />
          <PremiumFeaturesGrid features={premiumFeatures} />
          <PremiumPackages packages={premiumPackages} />
        </main>
      </div>
    </motion.div>
  )
}
