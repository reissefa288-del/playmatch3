import type { MatchGenderFilter, MatchFilters } from './types'

export const DEFAULT_MATCH_FILTERS: MatchFilters = {
  gender: 'female',
}

export const MATCH_GENDER_OPTIONS: { id: MatchGenderFilter; label: string }[] = [
  { id: 'female', label: 'Kadın' },
  { id: 'male', label: 'Erkek' },
]
