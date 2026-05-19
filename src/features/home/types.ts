import type { IconType } from 'react-icons'

export type PlayerGender = 'female' | 'male'

export type HomeGenderFilter = 'all' | PlayerGender

export type HomeDistanceKm = 10 | 15 | 25 | 50

export type HomeFilters = {
  gender: HomeGenderFilter
  maxDistanceKm: HomeDistanceKm
  onlineOnly: boolean
}

export type FilterItem = {
  id: string
  label: string
  icon?: IconType
  active?: boolean
}

export type FavoriteGame = {
  id: string
  label: string
}

export type HeroSocialPresence = {
  lastGame: string
  today: string
  matches: string
  mutuals: string
  voice: string
}

export type HeroDiscoveryTag = {
  label: string
  icon: 'gamepad' | 'trophy'
}

export type HeroDiscoveryPlayer = {
  id: string
  name: string
  age: number
  verified?: boolean
  isOnline?: boolean
  distance: string
  location: string
  compatibility: number
  portraitPosition: string
  social: HeroSocialPresence
  favoriteGames: FavoriteGame[]
  tags: HeroDiscoveryTag[]
}

export type HeroConnectionStatus = 'none' | 'pending' | 'matched'

export type NearbyPlayer = {
  id: string
  name: string
  age: number
  rank: string
  gameTags: string[]
  distance: string
  gender?: PlayerGender
  isOnline?: boolean
  verified?: boolean
  portraitPosition: string
}

export type BottomNavItem = {
  id: string
  label: string
  icon: IconType
  to?: string
  variant?: 'default' | 'premium'
  active?: boolean
  badge?: number
}