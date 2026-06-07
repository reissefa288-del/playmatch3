import { motion } from 'framer-motion'
import type { OnboardingStepMeta } from '../onboardingSteps'

type OnboardingStepHeroProps = {
  step: OnboardingStepMeta
}

export function OnboardingStepHero({ step }: OnboardingStepHeroProps) {
  const Icon = step.icon

  return (
    <motion.div
      className="pm-onboard-hero"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="pm-onboard-hero__ring" aria-hidden />
      <span className="pm-onboard-hero__icon">
        <Icon aria-hidden />
      </span>
    </motion.div>
  )
}
