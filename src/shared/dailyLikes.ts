export const DAILY_LIKES_LIMIT = 20

export const DAILY_LIKES_STORAGE_KEY = 'pm-daily-likes-quota'

export function dailyLikesDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export type DailyLikesQuotaRecord = {
  day: string
  used: number
}

export function readDailyLikesQuota(): DailyLikesQuotaRecord {
  try {
    const raw = localStorage.getItem(DAILY_LIKES_STORAGE_KEY)
    if (!raw) return { day: dailyLikesDayKey(), used: 0 }
    const parsed = JSON.parse(raw) as DailyLikesQuotaRecord
    if (parsed.day !== dailyLikesDayKey()) return { day: dailyLikesDayKey(), used: 0 }
    return parsed
  } catch {
    return { day: dailyLikesDayKey(), used: 0 }
  }
}

export function writeDailyLikesQuota(record: DailyLikesQuotaRecord) {
  try {
    localStorage.setItem(DAILY_LIKES_STORAGE_KEY, JSON.stringify(record))
  } catch {
    /* ignore */
  }
}

export function dailyLikesRemaining(used: number, limit = DAILY_LIKES_LIMIT) {
  return Math.max(0, limit - used)
}
