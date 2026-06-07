import type { MatchProfile } from './data'

export type MatchToastPayload = {
  id: number
  title: string
  subtitle?: string
  variant: 'premium' | 'invite' | 'warn' | 'success'
}

export type MatchDiscoverState = {
  current: MatchProfile | null
  peekLeft: MatchProfile | null
  peekRight: MatchProfile | null
  queueDone: boolean
  poolSize: number
  likesRemaining: number
  dailyLimit: number
  isUnlimited: boolean
  toast: MatchToastPayload | null
  canUndo: boolean
  canLike: boolean
  canAct: boolean
}

export type MatchDiscoverActions = {
  dismissToast: () => void
  pass: () => void
  like: () => void
  superLike: () => void
  gameInvite: () => void
  undo: () => void
  notify: (title: string, variant: MatchToastPayload['variant'], subtitle?: string) => void
}
