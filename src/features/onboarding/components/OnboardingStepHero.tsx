import type { OnboardingStepMeta } from '../onboardingSteps'

type OnboardingStepHeroProps = {
  step: OnboardingStepMeta
}

export function OnboardingStepHero({ step }: OnboardingStepHeroProps) {
  const Icon = step.icon

  return (
    <div
      className="pm-onboard-hero"
     
     
     
    >
      <span className="pm-onboard-hero__ring" aria-hidden />
      <span className="pm-onboard-hero__icon">
        <Icon aria-hidden />
      </span>
    </div>
  )
}
