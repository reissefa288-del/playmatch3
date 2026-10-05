import './lib/firebaseAdmin'
import { onRequest } from 'firebase-functions/v2/https'
import { region } from './lib/region'

export { consumeDailyLike } from './callables/consumeDailyLike'
export { deleteMyAccount } from './callables/deleteMyAccount'
export { syncPremiumEntitlement } from './callables/syncPremiumEntitlement'
export { onLikeCreated } from './triggers/onLikeCreated'
export { cascadeDeleteAccount } from './triggers/onUserDeleted'
export { onMatchCreatedPush, onMessageCreatedPush } from './triggers/onPushNotifications'

/** ADIM 4.1 — deploy smoke test */
export const health = onRequest({ region }, (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'playmeet-functions',
    region,
  })
})
