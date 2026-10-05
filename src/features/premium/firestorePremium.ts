import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp, isFirebaseConfigured } from '../auth/firebaseApp'
import type { PremiumEntitlement } from '../profile/types'
import {
  hydratePremiumEntitlement,
  isPremiumEntitlementActive,
  setCachedPremiumEntitlement,
} from './premiumEntitlementStore'

export const PLAY_PREMIUM_SKUS: Record<string, string> = {
  '1m': 'playmeet_premium_1m',
  '3m': 'playmeet_premium_3m',
  '12m': 'playmeet_premium_12m',
}

type SyncPremiumResponse = {
  premium: PremiumEntitlement
}

/** ADIM 8.2 — Play satın alma sonrası sunucu entitlement */
export async function syncPremiumPurchase(
  uid: string,
  productId: string,
  purchaseToken: string,
): Promise<PremiumEntitlement> {
  const app = getFirebaseApp()
  if (!app || !isFirebaseConfigured()) {
    throw new Error('Firebase yapılandırması eksik.')
  }

  const callable = httpsCallable<
    { productId: string; purchaseToken: string; packageName?: string },
    SyncPremiumResponse
  >(getFunctions(app, 'europe-west1'), 'syncPremiumEntitlement')

  const result = await callable({
    productId,
    purchaseToken,
    packageName: 'app.playmeet.twa',
  })

  const premium = result.data.premium
  setCachedPremiumEntitlement(uid, premium)
  return premium
}

export async function refreshPremiumEntitlement(uid: string): Promise<boolean> {
  await hydratePremiumEntitlement(uid)
  return isPremiumEntitlementActive(
    (await import('./premiumEntitlementStore')).readCachedPremiumEntitlement(),
  )
}
