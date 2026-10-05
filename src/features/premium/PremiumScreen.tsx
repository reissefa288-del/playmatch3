import '../../styles/premium-feature-icons.css'
import '../../styles/premium.css'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { premiumFeatures, premiumPackages } from './data'
import { PremiumFeaturesGrid } from './components/PremiumFeaturesGrid'
import { PremiumHero } from './components/PremiumHero'
import { PremiumPackages } from './components/PremiumPackages'
import { PremiumSheet } from './components/PremiumSheet'
import { PremiumTitleBar } from './components/PremiumTitleBar'
import { PremiumToast } from './components/PremiumToast'
import { usePremiumScreen } from './usePremiumScreen'
import { isPremiumFeatureEnabled } from './premiumAvailability'
import { PremiumComingSoon } from './PremiumComingSoon'

export function PremiumScreen() {
  if (!isPremiumFeatureEnabled()) {
    return <PremiumComingSoon />
  }
  return <PremiumScreenEnabled />
}

function PremiumScreenEnabled() {
  const premium = usePremiumScreen()

  useEffect(() => {
    if (!premium.sheet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [premium.sheet])

  const sheetPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <PremiumSheet
            kind={premium.sheet}
            selectedPackage={premium.selectedPackage}
            selectedPackageId={premium.selectedPackageId}
            onSelectPackage={premium.setSelectedPackageId}
            onClose={premium.closeSheet}
            onConfirmUpgrade={premium.confirmUpgrade}
            onConfirmGift={premium.confirmGift}
          />,
          document.body,
        )
      : null

  return (
    <div
      className="pm-app-shell pm-app-shell--premium"
     
     
     
    >
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-premium">
          <Navbar />
          <PremiumTitleBar onGift={premium.openGift} />
          <PremiumHero onUpgrade={premium.openUpgrade} />
          <PremiumFeaturesGrid features={premiumFeatures} />
          <PremiumPackages
            packages={premiumPackages}
            selectedId={premium.selectedPackageId}
            onSelect={premium.setSelectedPackageId}
            onUpgrade={premium.openUpgrade}
          />
        </main>
        <PremiumToast toast={premium.toast} onDismiss={premium.dismissToast} />
      </div>
      {sheetPortal}
    </div>
  )
}
