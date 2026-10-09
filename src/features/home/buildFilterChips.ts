import { FiUsers } from 'react-icons/fi'
import { HOME_GENDER_OPTIONS } from './homeFilters'
import type { FilterItem, HomeFilters } from './types'

export function buildFilterChips(filters: HomeFilters): FilterItem[] {
  const genderLabel =
    filters.gender === 'all'
      ? 'Cinsiyet'
      : (HOME_GENDER_OPTIONS.find((o) => o.id === filters.gender)?.label ?? 'Cinsiyet')

  return [
    { id: 'distance', label: `0–${filters.maxDistanceKm} km` },
    { id: 'online', label: 'Çevrimiçi', active: filters.onlineOnly },
    { id: 'gender', label: genderLabel, icon: FiUsers },
  ]
}
