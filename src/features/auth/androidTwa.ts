import { canUseRedirectAuthStorage } from './authRedirectStorage'

/** Android Trusted Web Activity / standalone PWA detection for auth strategy. */
export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}

/** TWA referrer from Android app wrapper. */
export function hasAndroidAppReferrer(): boolean {
  if (typeof document === 'undefined') return false
  return document.referrer.startsWith('android-app://')
}

/**
 * Redirect only on Android TWA when sessionStorage is available.
 * Desktop / Safari / gizli sekme → popup (redirect "missing initial state" verir).
 */
export function shouldUseGoogleRedirectSignIn(): boolean {
  if (!canUseRedirectAuthStorage()) return false
  if (!isAndroidDevice()) return false
  return isStandaloneDisplayMode() || hasAndroidAppReferrer()
}

/** ADIM 9.2 — TWA / standalone PWA bağlamı (push + auth) */
export function isTwaOrStandalone(): boolean {
  return isStandaloneDisplayMode() || hasAndroidAppReferrer()
}
