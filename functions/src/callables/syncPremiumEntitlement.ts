import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defaultPremiumExpiry, writePremiumEntitlement } from '../lib/premiumEntitlement'
import { region } from '../lib/region'

const ALLOWED_SKUS = new Set([
  'playmeet_premium_1m',
  'playmeet_premium_3m',
  'playmeet_premium_12m',
])

/** ADIM 8.2 — Play purchase token → Firestore entitlement (kapalı test stub doğrulama) */
export const syncPremiumEntitlement = onCall({ region }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Giriş gerekli.')
  }

  const productId = String(request.data?.productId ?? '')
  const purchaseToken = String(request.data?.purchaseToken ?? '')
  if (!productId || !purchaseToken) {
    throw new HttpsError('invalid-argument', 'productId ve purchaseToken gerekli.')
  }
  if (!ALLOWED_SKUS.has(productId)) {
    throw new HttpsError('invalid-argument', 'Geçersiz premium ürün.')
  }

  // Production: Google Play Developer API ile purchaseToken doğrula.
  const source = purchaseToken.startsWith('stub-') ? 'stub' : 'play'
  const premium = await writePremiumEntitlement(uid, productId, source, defaultPremiumExpiry())

  return { premium }
})
