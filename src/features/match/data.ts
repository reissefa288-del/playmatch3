import type { FakePortraitGender } from '../../shared/fakePortraits'
import { DAILY_LIKES_LIMIT } from '../../shared/dailyLikes'

export { DAILY_LIKES_LIMIT }

export type MatchTabId = 'discover' | 'matches'

export type MatchGameChip = {
  id: string
  label: string
  emoji: string
  more?: boolean
}

export type MatchStyleTag = {
  id: string
  label: string
  icon: 'gamepad' | 'target' | 'trophy'
}

export type MatchPhoto = {
  id: string
  src: string
  objectPosition: string
}

export type MatchProfile = {
  id: string
  name: string
  age: number
  gender: FakePortraitGender
  portraitSrc: string
  verified?: boolean
  online: boolean
  compatibility: number
  province: string
  distance: string
  location: string
  tags: MatchStyleTag[]
  favoriteGames: MatchGameChip[]
  bio: string
  photos: MatchPhoto[]
}

export const matchTabs: { id: MatchTabId; label: string; badge?: number }[] = [
  { id: 'discover', label: 'Keşfet' },
  { id: 'matches', label: 'Eşleşmelerim' },
]

export const matchPeekCards = {
  left: { name: '' },
  right: { name: '' },
}
