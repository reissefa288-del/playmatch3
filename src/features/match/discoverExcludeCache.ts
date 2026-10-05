import {
  fetchMatchedPartnerUids,
  fetchOutgoingLikeTargets,
} from './firestoreMatch'
import { fetchBlockedPartnerUids } from '../moderation/firestoreModeration'

export type DiscoverExcludeSets = {
  liked: Set<string>
  matched: Set<string>
  blocked: Set<string>
}

const CACHE_TTL_MS = 60_000
let cached: { uid: string; sets: DiscoverExcludeSets; loadedAt: number } | null = null

export async function getDiscoverExcludeSets(viewerUid: string): Promise<DiscoverExcludeSets> {
  const now = Date.now()
  if (cached?.uid === viewerUid && now - cached.loadedAt < CACHE_TTL_MS) {
    return cached.sets
  }

  const [liked, matched, blocked] = await Promise.all([
    fetchOutgoingLikeTargets(viewerUid),
    fetchMatchedPartnerUids(viewerUid),
    fetchBlockedPartnerUids(viewerUid),
  ])

  const sets = { liked, matched, blocked }
  cached = { uid: viewerUid, sets, loadedAt: now }
  return sets
}

export function invalidateDiscoverExcludeSets(viewerUid?: string) {
  if (!viewerUid || cached?.uid === viewerUid) {
    cached = null
  }
}

export function buildDiscoverExcludedUids(
  viewerUid: string,
  sets: DiscoverExcludeSets,
): Set<string> {
  return new Set<string>([
    viewerUid,
    ...sets.liked,
    ...sets.matched,
    ...sets.blocked,
  ])
}
