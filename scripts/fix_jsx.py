from pathlib import Path

BASE = Path(r"c:\Users\farec\Desktop\PlayMeet")
BAD = "</" + "motion.div>"
GOOD = "</" + "motion.div>"


def swap(path: str, bad_snippet: str, good_snippet: str) -> None:
    p = BASE / path
    text = p.read_text(encoding="utf-8")
    if bad_snippet not in text:
        print("missing pattern", path)
        return
    p.write_text(text.replace(bad_snippet, good_snippet, 1), encoding="utf-8", newline="\n")
    print("fixed", path)


def main() -> None:
    swap(
        "src/features/games/components/GamesHeader.tsx",
        f"        {BAD}\n      </header>",
        f"        {GOOD}\n      </header>",
    )
    swap(
        "src/features/match/components/MatchBoostPanel.tsx",
        f"      {BAD}\n    </motion.section>",
        f"      {GOOD}\n    </motion.section>",
    )
    swap(
        "src/features/match/components/MatchTabs.tsx",
        f"    {BAD}\n  )",
        f"    {GOOD}\n  )",
    )
    swap(
        "src/features/premium/components/PremiumPackages.tsx",
        f"      {BAD}\n\n      <p",
        f"      {GOOD}\n\n      <p",
    )

    ph = BASE / "src/features/profile/components/ProfileHero.tsx"
    t = ph.read_text(encoding="utf-8")
    t = t.replace(
        '        <div className="pm-profile-hero__name-row">',
        '        <motion.div className="pm-profile-hero__name-row">',
    )
    ph.write_text(t, encoding="utf-8", newline="\n")
    print("fixed ProfileHero open tag")

    prem = BASE / "src/features/premium/PremiumScreen.tsx"
    prem.write_text(
        """import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { premiumFeatures, premiumPackages, premiumTopCurrencies } from './data'
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
          <Navbar currencies={premiumTopCurrencies} />
          <PremiumTitleBar />
          <PremiumHero />
          <PremiumFeaturesGrid features={premiumFeatures} />
          <PremiumPackages packages={premiumPackages} />
        </main>
      </div>
    </motion.div>
  )
}
""",
        encoding="utf-8",
        newline="\n",
    )
    print("rewrote PremiumScreen")


if __name__ == "__main__":
    main()
