import { isFirebaseConfigured } from '../auth/firebaseApp'
import {
  DAILY_LIKES_LIMIT,
  dailyLikesDayKey,
  dailyLikesRemaining,
  readDailyLikesQuota,
  writeDailyLikesQuota,
} from '../../shared/dailyLikes'
import { isPremiumActiveFromCache } from '../premium/premiumEntitlementStore'
import { tryServerConsumeDailyLike } from './consumeDailyLikeCallable'
import { readFirestoreDailyLikes } from './firestoreDailyLikes'

let cachedUsed = 0
let cachedDay = dailyLikesDayKey()

export function resetDailyLikesCache() {
  cachedUsed = 0
  cachedDay = dailyLikesDayKey()
}

export async function hydrateDailyLikesCache(uid: string | null): Promise<void> {
  cachedDay = dailyLikesDayKey()

  if (!uid) {
    cachedUsed = 0
    return
  }

  if (isFirebaseConfigured()) {
    cachedUsed = await readFirestoreDailyLikes(uid)
    return
  }

  const quota = readDailyLikesQuota()
  cachedUsed = quota.day === cachedDay ? quota.used : 0
}

function ensureDay() {
  const today = dailyLikesDayKey()
  if (cachedDay !== today) {
    cachedUsed = 0
    cachedDay = today
  }
}

export function readCachedDailyLikesUsed(): number {
  ensureDay()
  return cachedUsed
}

/** ADIM 4.3 — sunucu kotası (CF) veya local fallback (firebase yok / CF kapalı) */
export async function tryConsumeDailyLike(uid: string | null): Promise<boolean> {
  if (!uid) return false
  if (isPremiumActiveFromCache()) return true

  ensureDay()
  if (cachedUsed >= DAILY_LIKES_LIMIT) return false

  if (isFirebaseConfigured()) {
    const result = await tryServerConsumeDailyLike()
    if (result === 'limit') return false
    if (result === 'ok') {
      cachedUsed = await readFirestoreDailyLikes(uid)
      return true
    }
  }

  cachedUsed += 1
  writeDailyLikesQuota({ day: cachedDay, used: cachedUsed })
  return true
}

export function readDailyLikesViewFromCache() {
  const premiumActive = isPremiumActiveFromCache()
  const used = readCachedDailyLikesUsed()
  const remaining = dailyLikesRemaining(used)

  return {
    limit: DAILY_LIKES_LIMIT,
    used,
    remaining,
    isUnlimited: premiumActive,
    canSendLike: premiumActive || remaining > 0,
  }
}
