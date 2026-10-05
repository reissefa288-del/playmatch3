import type { MatchPreference } from '../onboarding/onboardingProfile'
import type { MatchGenderFilter } from '../match/types'
import type { HomeGenderFilter } from './types'

export function homeGenderToDiscoverFilter(
  homeGender: HomeGenderFilter,
  matchPreference: MatchPreference = 'female',
): MatchGenderFilter {
  if (homeGender === 'female' || homeGender === 'male') return homeGender
  if (matchPreference === 'male' || matchPreference === 'female') return matchPreference
  return 'female'
}
