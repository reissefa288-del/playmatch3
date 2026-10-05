import { isFirebaseConfigured } from '../auth/firebaseApp'
import { invalidateDiscoverExcludeSets } from './discoverExcludeCache'
import {
  fetchMatchProfiles,
  fetchOutgoingLikeTargets,
  sendFirestoreLike,
  type SendLikeResult,
} from './firestoreMatch'
import type { MatchSource } from './matchFirestoreTypes'
import { recordProfileLikeSent } from '../profile/profileStats'
import type { MatchProfile } from './data'

export type MatchConnectionsSnapshot = {
  matches: MatchProfile[]
  likedUids: Set<string>
  loading: boolean
  error: string | null
  uid: string | null
}

let snapshot: MatchConnectionsSnapshot = {
  matches: [],
  likedUids: new Set(),
  loading: false,
  error: null,
  uid: null,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setSnapshot(next: MatchConnectionsSnapshot) {
  snapshot = next
  emit()
}

export function subscribeMatchConnections(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMatchConnectionsSnapshot(): MatchConnectionsSnapshot {
  return snapshot
}

let loadGeneration = 0

export async function refreshMatchConnections(uid: string | null): Promise<void> {
  const generation = ++loadGeneration

  if (!uid) {
    setSnapshot({
      matches: [],
      likedUids: new Set(),
      loading: false,
      error: null,
      uid: null,
    })
    return
  }

  setSnapshot({ ...snapshot, loading: true, error: null, uid })

  if (!isFirebaseConfigured()) {
    if (generation !== loadGeneration) return
    setSnapshot({
      matches: [],
      likedUids: new Set(),
      loading: false,
      error: null,
      uid,
    })
    return
  }

  try {
    const [matches, likedUids] = await Promise.all([
      fetchMatchProfiles(uid),
      fetchOutgoingLikeTargets(uid),
    ])
    if (generation !== loadGeneration) return
    setSnapshot({
      matches,
      likedUids,
      loading: false,
      error: null,
      uid,
    })
  } catch {
    if (generation !== loadGeneration) return
    setSnapshot({
      ...snapshot,
      loading: false,
      error: 'Eşleşmeler yüklenemedi.',
      uid,
    })
  }
}

export async function sendLikeAndRefresh(
  fromUid: string,
  toUid: string,
  source: MatchSource,
): Promise<SendLikeResult> {
  const result = await sendFirestoreLike(fromUid, toUid, source)
  if (!snapshot.likedUids.has(toUid)) {
    recordProfileLikeSent()
  }
  invalidateDiscoverExcludeSets(fromUid)
  const likedUids = new Set(snapshot.likedUids)
  likedUids.add(toUid)
  setSnapshot({ ...snapshot, likedUids })
  await refreshMatchConnections(fromUid)
  return result
}

export function hasLikedUid(targetUid: string): boolean {
  return snapshot.likedUids.has(targetUid)
}

export function readMatchedProfiles(): MatchProfile[] {
  return snapshot.matches
}
