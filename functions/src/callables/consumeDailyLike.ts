import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { DAILY_LIKES_LIMIT, incrementDailyLike } from '../lib/dailyLikes'
import { isUserPremium } from '../lib/premiumEntitlement'
import { region } from '../lib/region'

/** ADIM 4.3 — client like öncesi sunucu kotası */
export const consumeDailyLike = onCall({ region }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Giriş gerekli.')
  }

  if (await isUserPremium(request.auth.uid)) {
    return {
      count: 0,
      remaining: DAILY_LIKES_LIMIT,
      limit: DAILY_LIKES_LIMIT,
      unlimited: true,
    }
  }

  const result = await incrementDailyLike(request.auth.uid)
  if (!result.allowed) {
    throw new HttpsError('resource-exhausted', 'Günlük beğeni limitine ulaştın.')
  }

  return {
    count: result.count,
    remaining: Math.max(0, DAILY_LIKES_LIMIT - result.count),
    limit: DAILY_LIKES_LIMIT,
  }
})
