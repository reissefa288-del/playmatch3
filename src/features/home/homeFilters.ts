import type { HomeDistanceKm, HomeFilters, HomeGenderFilter } from './types'

export const DEFAULT_HOME_FILTERS: HomeFilters = {
  gender: 'all',
  maxDistanceKm: 25,
  onlineOnly: true,
}

export const HOME_GENDER_OPTIONS: { id: HomeGenderFilter; label: string }[] = [
  { id: 'all', label: 'Hepsi' },
  { id: 'female', label: 'Kadın' },
  { id: 'male', label: 'Erkek' },
]

export const HOME_DISTANCE_OPTIONS: { id: HomeDistanceKm; label: string }[] = [
  { id: 10, label: '10 km' },
  { id: 15, label: '15 km' },
  { id: 25, label: '25 km' },
  { id: 50, label: '50 km' },
]
