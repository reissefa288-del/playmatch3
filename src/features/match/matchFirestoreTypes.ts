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
  sources: MatchSource[]
}

export type FirestoreDailyLikesDocument = {
  count: number
  date: string
}
