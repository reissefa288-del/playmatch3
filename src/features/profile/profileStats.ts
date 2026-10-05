export const PROFILE_STATS_STORAGE_KEY = 'pm-profile-stats-v1'

export type ProfileStatsSnapshot = {
  likesSent: number
  profileVisits: number
}

export const DEFAULT_PROFILE_STATS: ProfileStatsSnapshot = {
  likesSent: 0,
  profileVisits: 0,
}

export type ProfileDisplayStats = {
  friends: number
  likes: number
  visits: number
  matches: number
}

const STAT_STRIP_LABELS: Record<keyof ProfileDisplayStats, string> = {
  friends: 'Arkadaş',
  likes: 'Beğeni',
  visits: 'Ziyaretçi',
  matches: 'Ortak Match',
}

export function formatProfileStatCount(value: number): string {
  const safe = Math.max(0, Math.floor(value))
  if (safe >= 1_000_000) {
    const compact = safe / 1_000_000
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}M`
  }
  if (safe >= 10_000) {
    const compact = safe / 1000
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}K`
  }
  if (safe >= 1000) {
    const compact = safe / 1000
    const text = compact.toFixed(1)
    return text.endsWith('.0') ? `${Math.round(compact)}K` : `${text}K`
  }
  return safe.toLocaleString('tr-TR')
}

export function loadStoredProfileStats(): ProfileStatsSnapshot {
  if (typeof window === 'undefined') return DEFAULT_PROFILE_STATS
  try {
    const raw = localStorage.getItem(PROFILE_STATS_STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE_STATS
    const parsed = JSON.parse(raw) as Partial<ProfileStatsSnapshot>
    return {
      likesSent: sanitizeCount(parsed.likesSent),
      profileVisits: sanitizeCount(parsed.profileVisits),
    }
  } catch {
    return DEFAULT_PROFILE_STATS
  }
}

export function saveProfileStats(stats: ProfileStatsSnapshot) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILE_STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch {
    /* ignore */
  }
}

function sanitizeCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}

let stats = loadStoredProfileStats()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeProfileStats(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProfileStatsSnapshot(): ProfileStatsSnapshot {
  return stats
}

function setStats(next: ProfileStatsSnapshot) {
  stats = next
  saveProfileStats(next)
  emit()
}

export function recordProfileLikeSent() {
  setStats({ ...stats, likesSent: stats.likesSent + 1 })
}

export function recordProfileVisit() {
  setStats({ ...stats, profileVisits: stats.profileVisits + 1 })
}

export function buildProfileStatStripItems(display: ProfileDisplayStats) {
  return (['friends', 'likes', 'visits', 'matches'] as const).map((id) => ({
    id,
    value: formatProfileStatCount(display[id]),
    label: STAT_STRIP_LABELS[id],
  }))
}
