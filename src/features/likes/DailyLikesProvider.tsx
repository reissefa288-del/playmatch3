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
  readDailyLikesQuota,
  writeDailyLikesQuota,
} from '../../shared/dailyLikes'
import { isPremiumActive } from '../premium/premiumSubscription'
import {
  getDailyLikesSyncSnapshot,
  notifyDailyLikesSyncChanged,
  readDailyLikesView,
  subscribeDailyLikesSync,
  type DailyLikesView,
} from './dailyLikesSync'

type DailyLikesActions = {
  tryConsumeLike: () => boolean
}

const DailyLikesActionsContext = createContext<DailyLikesActions | null>(null)

export function DailyLikesProvider({ children }: { children: ReactNode }) {
  const tryConsumeLike = useCallback(() => {
    if (isPremiumActive()) return true

    const current = readDailyLikesQuota()
    const day = dailyLikesDayKey()
    const usedToday = current.day === day ? current.used : 0

    if (usedToday >= DAILY_LIKES_LIMIT) {
      notifyDailyLikesSyncChanged()
      return false
    }

    writeDailyLikesQuota({ day, used: usedToday + 1 })
    notifyDailyLikesSyncChanged()
    return true
  }, [])

  const actionsValue = useMemo(() => ({ tryConsumeLike }), [tryConsumeLike])

  return (
    <DailyLikesActionsContext.Provider value={actionsValue}>{children}</DailyLikesActionsContext.Provider>
  )
}

export function useDailyLikesState(): DailyLikesView {
  useSyncExternalStore(subscribeDailyLikesSync, getDailyLikesSyncSnapshot, getDailyLikesSyncSnapshot)
  return readDailyLikesView()
}

export function useDailyLikesActions() {
  const ctx = useContext(DailyLikesActionsContext)
  if (!ctx) throw new Error('useDailyLikesActions must be used within DailyLikesProvider')
  return ctx
}

export function useDailyLikes() {
  const state = useDailyLikesState()
  const { tryConsumeLike } = useDailyLikesActions()
  return { ...state, tryConsumeLike }
}

export function notifyDailyLikesChanged() {
  notifyDailyLikesSyncChanged()
}
