import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { shouldUseGoogleRedirectSignIn } from './androidTwa'
import { canUseRedirectAuthStorage, redirectAuthBlockedMessage } from './authRedirectStorage'
import { getFirebaseAuth, whenAuthPersistenceReady } from './firebaseApp'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export type GoogleSignInErrorCode =
  | 'not-configured'
  | 'popup-closed'
  | 'popup-blocked'
  | 'redirect-cancelled'
  | 'network'
  | 'unknown'

export class GoogleSignInError extends Error {
  readonly code: GoogleSignInErrorCode

  constructor(code: GoogleSignInErrorCode, message: string) {
    super(message)
    this.name = 'GoogleSignInError'
    this.code = code
  }
}

function mapFirebaseAuthError(error: unknown): GoogleSignInError {
  const firebaseCode =
    typeof error === 'object' && error != null && 'code' in error
      ? String((error as { code: string }).code)
      : ''
  const firebaseMessage =
    typeof error === 'object' && error != null && 'message' in error
      ? String((error as { message: string }).message)
      : error instanceof Error
        ? error.message
        : String(error)

  if (
    firebaseMessage.includes('missing initial state') ||
    firebaseCode === 'auth/redirect-storage-unavailable'
  ) {
    return new GoogleSignInError('redirect-cancelled', redirectAuthBlockedMessage())
  }

  if (firebaseCode === 'auth/popup-closed-by-user') {
    return new GoogleSignInError('popup-closed', 'Google oturum penceresi kapatıldı.')
  }
  if (firebaseCode === 'auth/popup-blocked') {
    return new GoogleSignInError(
      'popup-blocked',
      'Tarayıcı Google oturum penceresini engelledi. Lütfen açılır pencerelere izin ver.',
    )
  }
  if (firebaseCode === 'auth/redirect-cancelled-by-user') {
    return new GoogleSignInError('redirect-cancelled', 'Google oturum yönlendirmesi iptal edildi.')
  }
  if (firebaseCode === 'auth/network-request-failed') {
    return new GoogleSignInError('network', 'Ağ hatası. İnternet bağlantını kontrol et.')
  }

  return new GoogleSignInError('unknown', 'Google ile giriş yapılamadı. Lütfen tekrar dene.')
}

export type GoogleSignInResult =
  | { mode: 'popup'; user: User }
  | { mode: 'redirect' }

function waitForAuthUserAfterSignIn(auth: Auth, previousUid: string | null, timeoutMs: number): Promise<User> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | undefined
    const timer = window.setTimeout(() => {
      unsubscribe?.()
      reject(
        new GoogleSignInError(
          'unknown',
          'Google oturumu tamamlanamadı. Açık kalan auth sekmesini kapatıp Chrome’da tekrar dene.',
        ),
      )
    }, timeoutMs)

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return
      if (previousUid && user.uid === previousUid) return
      window.clearTimeout(timer)
      unsubscribe?.()
      resolve(user)
    })
  })
}

export async function signInWithGooglePopup(): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new GoogleSignInError(
      'not-configured',
      'Firebase yapılandırması eksik. Ortam değişkenlerini kontrol et.',
    )
  }

  await whenAuthPersistenceReady()

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    throw mapFirebaseAuthError(error)
  }
}

/**
 * Popup firebaseapp.com/__/auth/handler üzerinde takılı kalsa bile
 * onAuthStateChanged ile oturumu yakalar (Safari / Edge / reklam engelleyici).
 */
export async function signInWithGooglePopupReliable(): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new GoogleSignInError(
      'not-configured',
      'Firebase yapılandırması eksik. Ortam değişkenlerini kontrol et.',
    )
  }

  await whenAuthPersistenceReady()
  const previousUid = auth.currentUser?.uid ?? null

  try {
    return await Promise.race([
      signInWithGooglePopup(),
      waitForAuthUserAfterSignIn(auth, previousUid, 120_000),
    ])
  } catch (error) {
    if (error instanceof GoogleSignInError) throw error
    throw mapFirebaseAuthError(error)
  }
}

export async function signInWithGoogleRedirect(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new GoogleSignInError(
      'not-configured',
      'Firebase yapılandırması eksik. Ortam değişkenlerini kontrol et.',
    )
  }

  await whenAuthPersistenceReady()

  if (!canUseRedirectAuthStorage()) {
    throw new GoogleSignInError('redirect-cancelled', redirectAuthBlockedMessage())
  }

  try {
    await signInWithRedirect(auth, googleProvider)
  } catch (error) {
    throw mapFirebaseAuthError(error)
  }
}

/** Popup on desktop; redirect on Android TWA where popups may fail. */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (shouldUseGoogleRedirectSignIn()) {
    await signInWithGoogleRedirect()
    return { mode: 'redirect' }
  }
  const user = await signInWithGooglePopupReliable()
  return { mode: 'popup', user }
}

let redirectResultPromise: Promise<User | null> | null = null

/** App load / welcome — redirect ile dönen Google oturumunu tamamlar (TWA). */
export async function handleGoogleRedirectResult(): Promise<User | null> {
  if (redirectResultPromise) return redirectResultPromise

  redirectResultPromise = (async () => {
    const auth = getFirebaseAuth()
    if (!auth) return null

    await whenAuthPersistenceReady()

    try {
      const result = await getRedirectResult(auth)
      return result?.user ?? null
    } catch (error) {
      const mapped = mapFirebaseAuthError(error)
      if (mapped.code === 'redirect-cancelled') return null
      throw mapped
    } finally {
      redirectResultPromise = null
    }
  })()

  return redirectResultPromise
}

export { shouldUseGoogleRedirectSignIn } from './androidTwa'

export async function signOutFromFirebase(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) return
  await firebaseSignOut(auth)
}

export function subscribeFirebaseAuth(listener: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth()
  if (!auth) {
    listener(null)
    return () => {}
  }

  let unsubscribe: (() => void) | undefined
  let cancelled = false

  void whenAuthPersistenceReady().then(() => {
    if (cancelled) return
    unsubscribe = onAuthStateChanged(auth, listener)
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}
