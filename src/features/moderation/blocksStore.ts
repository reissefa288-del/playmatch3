import { isFirebaseConfigured } from '../auth/firebaseApp'
import { fetchBlockedPartnerUids } from './firestoreModeration'

export type BlocksSnapshot = {
  blockedUids: Set<string>
  loading: boolean
  uid: string | null
}

let snapshot: BlocksSnapshot = {
  blockedUids: new Set(),
  loading: false,
  uid: null,
}

const listeners = new Set<() => void>()
let loadGeneration = 0

function emit() {
  listeners.forEach((listener) => listener())
}

function setSnapshot(next: BlocksSnapshot) {
  snapshot = next
  emit()
}

export function subscribeBlockedPartners(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getBlockedPartnersSnapshot(): BlocksSnapshot {
  return snapshot
}

export function isPartnerBlocked(targetUid: string): boolean {
  return snapshot.blockedUids.has(targetUid)
}

export async function refreshBlockedPartners(uid: string | null): Promise<void> {
  const generation = ++loadGeneration

  if (!uid) {
    setSnapshot({ blockedUids: new Set(), loading: false, uid: null })
    return
  }

  setSnapshot({ ...snapshot, loading: true, uid })

  if (!isFirebaseConfigured()) {
    if (generation !== loadGeneration) return
    setSnapshot({ blockedUids: new Set(), loading: false, uid })
    return
  }

  try {
    const blockedUids = await fetchBlockedPartnerUids(uid)
    if (generation !== loadGeneration) return
    setSnapshot({ blockedUids, loading: false, uid })
  } catch {
    if (generation !== loadGeneration) return
    setSnapshot({ ...snapshot, loading: false, uid })
  }
}
