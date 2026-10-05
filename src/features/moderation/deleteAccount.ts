import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp, getFirebaseAuth, isFirebaseConfigured } from '../auth/firebaseApp'
import { purgeLocalUserData } from './purgeLocalUserData'

export class DeleteAccountError extends Error {
  readonly code: 'not-configured' | 'not-signed-in' | 'requires-recent-login' | 'unknown'

  constructor(code: DeleteAccountError['code'], message: string) {
    super(message)
    this.name = 'DeleteAccountError'
    this.code = code
  }
}

function mapCallableError(error: unknown): DeleteAccountError {
  const code =
    typeof error === 'object' && error != null && 'code' in error
      ? String((error as { code: string }).code)
      : ''

  if (code.includes('unauthenticated')) {
    return new DeleteAccountError('not-signed-in', 'Oturum bulunamadı.')
  }
  if (code.includes('failed-precondition') || code.includes('requires-recent-login')) {
    return new DeleteAccountError(
      'requires-recent-login',
      'Güvenlik için tekrar Google ile giriş yapıp hesap silmeyi yeniden dene.',
    )
  }
  return new DeleteAccountError('unknown', 'Hesap silinemedi. Lütfen tekrar dene.')
}

/** ADIM 11.3 — Callable CF silme + yerel cache temizliği */
export async function deletePlayMeetAccount(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new DeleteAccountError('not-configured', 'Firebase yapılandırması eksik.')
  }

  const auth = getFirebaseAuth()
  const user = auth?.currentUser
  if (!user || user.uid !== uid) {
    throw new DeleteAccountError('not-signed-in', 'Oturum bulunamadı.')
  }

  const app = getFirebaseApp()
  if (!app) {
    throw new DeleteAccountError('not-configured', 'Firebase yapılandırması eksik.')
  }

  try {
    const callable = httpsCallable(getFunctions(app, 'europe-west1'), 'deleteMyAccount')
    await callable()
    purgeLocalUserData()
  } catch (error) {
    throw mapCallableError(error)
  }
}
