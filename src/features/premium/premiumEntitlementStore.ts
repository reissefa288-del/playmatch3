import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import type { PremiumEntitlement } from '../profile/types'

let cachedUid: string | null = null
let cachedEntitlement: PremiumEntitlement | null = null

function inactiveEntitlement(): PremiumEntitlement {
  return {
    active: false,
    productId: null,
    expiresAt: null,
    source: null,
    updatedAt: 0,
  }
}

export function isPremiumEntitlementActive(entitlement: PremiumEntitlement | null | undefined): boolean {
  if (!entitlement?.active) return false
  if (entitlement.expiresAt != null && entitlement.expiresAt < Date.now()) return false
  return true
}

export async function hydratePremiumEntitlement(uid: string | null): Promise<void> {
  if (!uid) {
    cachedUid = null
    cachedEntitlement = null
    return
  }

  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    cachedUid = uid
    cachedEntitlement = inactiveEntitlement()
    return
  }

  const snap = await getDoc(doc(db, 'users', uid))
  const premium = snap.exists() ? (snap.data().premium as PremiumEntitlement | undefined) : undefined
  cachedUid = uid
  cachedEntitlement = premium ?? inactiveEntitlement()
}

export function readCachedPremiumEntitlement(): PremiumEntitlement {
  return cachedEntitlement ?? inactiveEntitlement()
}

export function isPremiumActiveFromCache(): boolean {
  return isPremiumEntitlementActive(cachedEntitlement)
}

export function setCachedPremiumEntitlement(uid: string, entitlement: PremiumEntitlement): void {
  cachedUid = uid
  cachedEntitlement = entitlement
}

export function getCachedPremiumUid(): string | null {
  return cachedUid
}
