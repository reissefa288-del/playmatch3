import { logger } from 'firebase-functions/v1'
import * as functions from 'firebase-functions/v1'
import { cascadeDeleteUserData } from '../lib/deleteUserCascade'

/** ADIM 4.4 — Firebase Auth kullanıcı silindiğinde cascade */
export const cascadeDeleteAccount = functions
  .region('europe-west1')
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid
    if (!uid) return

    logger.info('cascadeDeleteAccount başladı', { uid })
    await cascadeDeleteUserData(uid)
    logger.info('cascadeDeleteAccount tamamlandı', { uid })
  })
