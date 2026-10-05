import {
  DAILY_LIKES_STORAGE_KEY,
  dailyLikesDayKey,
} from '../../shared/dailyLikes'
import { readPremiumSubscriptionRaw } from '../premium/premiumSubscription'
import { readCachedDailyLikesUsed, readDailyLikesViewFromCache } from './dailyLikesCache'

type Listener = () => void

const listeners = new Set<Listener>()

export function subscribeDailyLikesSync(listener: Listener) {
  listeners.add(listener)

  const onVisibility = () => listener()
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === DAILY_LIKES_STORAGE_KEY ||
      event.key === 'pm-premium-subscription' ||
      event.key === null
    ) {
      listener()
    }
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('storage', onStorage)
  }
}

export function notifyDailyLikesSyncChanged() {
  listeners.forEach((listener) => listener())
}

export function getDailyLikesSyncSnapshot() {
  return `${dailyLikesDayKey()}:${readCachedDailyLikesUsed()}:${readPremiumSubscriptionRaw() ?? ''}`
}

export type DailyLikesView = {
  limit: number
  used: number
  remaining: number
  isUnlimited: boolean
  canSendLike: boolean
}

export function readDailyLikesView(): DailyLikesView {
  return readDailyLikesViewFromCache()
}
