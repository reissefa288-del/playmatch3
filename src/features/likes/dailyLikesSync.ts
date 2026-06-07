import {
  DAILY_LIKES_LIMIT,
  dailyLikesDayKey,
  dailyLikesRemaining,
  DAILY_LIKES_STORAGE_KEY,
  readDailyLikesQuota,
} from '../../shared/dailyLikes'
import { isPremiumActive, readPremiumSubscriptionRaw } from '../premium/premiumSubscription'

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
  const { day, used } = readDailyLikesQuota()
  return `${day}:${used}:${readPremiumSubscriptionRaw() ?? ''}`
}

export type DailyLikesView = {
  limit: number
  used: number
  remaining: number
  isUnlimited: boolean
  canSendLike: boolean
}

export function readDailyLikesView(): DailyLikesView {
  const premiumActive = isPremiumActive()
  const quota = readDailyLikesQuota()
  const used = quota.day === dailyLikesDayKey() ? quota.used : 0
  const remaining = dailyLikesRemaining(used)
  const isUnlimited = premiumActive

  return {
    limit: DAILY_LIKES_LIMIT,
    used,
    remaining,
    isUnlimited,
    canSendLike: isUnlimited || remaining > 0,
  }
}
