import type { MatchGenderFilter } from '../match/types'

const STORAGE_KEY = 'pm-user-profile'

export type MatchPreference = MatchGenderFilter | 'both'

export type UserProfile = {
  name: string
  age: number
  matchPreference: MatchPreference
  photoUrl: string
  interests: string[]
  bio: string
  email: string
  onboardingCompleted: boolean
  completedAt: number | null
}

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
    matchPreference: 'female',
    photoUrl: '',
    interests: [],
    bio: '',
    email: '',
    onboardingCompleted: false,
    completedAt: null,
  }
}

export function readUserProfileRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function readUserProfile(): UserProfile | null {
  const raw = readUserProfileRaw()
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function writeUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

export function clearUserProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function isOnboardingComplete(): boolean {
  return readUserProfile()?.onboardingCompleted === true
}

export function syncMatchFiltersFromOnboarding(preference: MatchPreference) {
  try {
    const gender = preference === 'both' ? 'female' : preference
    localStorage.setItem('pm-match-filters', JSON.stringify({ gender }))
  } catch {
    /* ignore */
  }
}
