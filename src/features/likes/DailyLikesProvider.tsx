import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  DAILY_LIKES_LIMIT,
  dailyLikesDayKey,
  dailyLikesRemaining,
  readDailyLikesQuota,
  writeDailyLikesQuota,
} from '../../shared/dailyLikes'
import { usePremiumSubscription } from '../premium/usePremiumSubscription'

type DailyLikesContextValue = {
  limit: number
  used: number
  remaining: number
  isUnlimited: boolean
  canSendLike: boolean
  tryConsumeLike: () => boolean
}

const DailyLikesContext = createContext<DailyLikesContextValue | null>(null)

let listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  const { day, used } = readDailyLikesQuota()
  return `${day}:${used}`
}

export function DailyLikesProvider({ children }: { children: ReactNode }) {
  const { isPremiumActive } = usePremiumSubscription()
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const quota = readDailyLikesQuota()
  const used = quota.used
  const remaining = dailyLikesRemaining(used)
  const isUnlimited = isPremiumActive
  const canSendLike = isUnlimited || remaining > 0

  const tryConsumeLike = useCallback(() => {
    if (isPremiumActive) return true

    const current = readDailyLikesQuota()
    const day = dailyLikesDayKey()
    const usedToday = current.day === day ? current.used : 0

    if (usedToday >= DAILY_LIKES_LIMIT) {
      emit()
      return false
    }

    writeDailyLikesQuota({ day, used: usedToday + 1 })
    emit()
    return true
  }, [isPremiumActive])

  const value = useMemo(
    () => ({
      limit: DAILY_LIKES_LIMIT,
      used,
      remaining,
      isUnlimited,
      canSendLike,
      tryConsumeLike,
    }),
    [used, remaining, isUnlimited, canSendLike, tryConsumeLike],
  )

  return <DailyLikesContext.Provider value={value}>{children}</DailyLikesContext.Provider>
}

export function useDailyLikes() {
  const ctx = useContext(DailyLikesContext)
  if (!ctx) {
    throw new Error('useDailyLikes must be used within DailyLikesProvider')
  }
  return ctx
}

export function notifyDailyLikesChanged() {
  emit()
}
