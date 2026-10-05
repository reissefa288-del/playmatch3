import type { MatchPreference } from '../onboarding/onboardingProfile'

export type UserGender = 'male' | 'female'

/** Onboarding UI değişmeden keşfet filtresi için cinsiyet tahmini. */
export function inferUserGender(matchPreference: MatchPreference): UserGender {
  if (matchPreference === 'female') return 'male'
  if (matchPreference === 'male') return 'female'
  return 'male'
}
