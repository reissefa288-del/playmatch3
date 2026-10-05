import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { cascadeDeleteUserData } from '../lib/deleteUserCascade'
import { region } from '../lib/region'

/** ADIM 11.3 — sunucu tarafı hesap silme (Auth + cascade) */
export const deleteMyAccount = onCall({ region }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Giriş gerekli.')
  }

  try {
    await cascadeDeleteUserData(uid)
    await getAuth().deleteUser(uid)
  } catch (error) {
    const code =
      typeof error === 'object' && error != null && 'code' in error
        ? String((error as { code: string }).code)
        : ''
    if (code === 'auth/requires-recent-login') {
      throw new HttpsError(
        'failed-precondition',
        'Güvenlik için tekrar giriş yapıp hesap silmeyi yeniden dene.',
      )
    }
    throw new HttpsError('internal', 'Hesap silinemedi.')
  }

  return { ok: true }
})
