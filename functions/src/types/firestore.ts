export type MatchSource = 'discover' | 'game'

export type FirestoreLikeDocument = {
  fromUid: string
  toUid: string
  createdAt: number
  source: MatchSource
}

export type FirestoreMatchDocument = {
  userA: string
  userB: string
  createdAt: number
  source: MatchSource
  sources?: MatchSource[]
  updatedAt?: number
}

export type FirestoreDailyLikesDocument = {
  count: number
  date: string
}

export type PremiumEntitlement = {
  active: boolean
  productId: string | null
  expiresAt: number | null
  source: 'play' | 'stub' | null
  updatedAt: number
}

export const COLLECTIONS = {
  users: 'users',
  likes: 'likes',
  matches: 'matches',
  dailyLikes: 'dailyLikes',
  blocks: 'blocks',
  reports: 'reports',
} as const
