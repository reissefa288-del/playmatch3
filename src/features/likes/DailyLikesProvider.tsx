import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import {
  hydrateDailyLikesCache,
  resetDailyLikesCache,
  tryConsumeDailyLike,
} from './dailyLikesCache'
import {
  getDailyLikesSyncSnapshot,
  notifyDailyLikesSyncChanged,
  readDailyLikesView,
  subscribeDailyLikesSync,
  type DailyLikesView,
} from './dailyLikesSync'

type DailyLikesActions = {
  tryConsumeLike: () => Promise<boolean>
}

const DailyLikesActionsContext = createContext<DailyLikesActions | null>(null)

export function DailyLikesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null

  useEffect(() => {
    if (!uid) {
      resetDailyLikesCache()
      notifyDailyLikesSyncChanged()
      return
    }
    void hydrateDailyLikesCache(uid).then(() => notifyDailyLikesSyncChanged())
  }, [uid])

  const tryConsumeLike = useCallback(async () => {
    const ok = await tryConsumeDailyLike(uid)
    if (ok) notifyDailyLikesSyncChanged()
    return ok
  }, [uid])

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
