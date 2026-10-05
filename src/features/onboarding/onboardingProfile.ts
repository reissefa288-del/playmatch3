import type { MatchGenderFilter } from '../match/types'
import type { UserProfile } from '../profile/types'

export type { UserProfile } from '../profile/types'

export type MatchPreference = MatchGenderFilter | 'both'

export const ONBOARDING_INTERESTS = [
  'Gamer',
  'Müzik',
  'Seyahat',
  'Film',
  'Spor',
  'FPS',
  'Strateji',
  'Sohbet',
  'E-Spor',
  'Anime',
  'Kitap',
  'Fitness',
  'MOBA',
  'Battle Royale',
  'Indie',
  'Cosplay',
] as const

export const REQUIRED_INTEREST_COUNT = 4

export const MATCH_PREFERENCE_OPTIONS: { id: MatchPreference; label: string; hint: string }[] = [
  { id: 'female', label: 'Kadınlar', hint: 'Kadın profillerle eşleş' },
  { id: 'male', label: 'Erkekler', hint: 'Erkek profillerle eşleş' },
  { id: 'both', label: 'Her ikisi', hint: 'Tüm profilleri keşfet' },
]

export function createEmptyProfile(): UserProfile {
  return {
    name: '',
    age: 18,
    gender: 'male',
    matchPreference: 'female',
    photoUrl: '',
    photoUrls: ['', '', ''],
    interests: [],
    bio: '',
    email: '',
    onboardingCompleted: false,
    completedAt: null,
  }
}

export function syncMatchFiltersFromOnboarding(preference: MatchPreference) {
  try {
    const gender = preference === 'both' ? 'female' : preference
    localStorage.setItem('pm-match-filters', JSON.stringify({ gender }))
  } catch {
    /* ignore */
  }
}
