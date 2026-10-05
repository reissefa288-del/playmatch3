import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check'
import type { FirebaseApp } from 'firebase/app'

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean
  }
}

let appCheckInstance: AppCheck | null = null
let initAttempted = false

export function isAppCheckConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY?.trim() ||
      (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?.trim()),
  )
}

/** ADIM 3.3 — Firebase App Check (reCAPTCHA v3 web / TWA). */
export function initFirebaseAppCheck(app: FirebaseApp): AppCheck | null {
  if (initAttempted) return appCheckInstance
  initAttempted = true

  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY?.trim() ?? ''
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?.trim() ?? ''

  if (import.meta.env.DEV && debugToken) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken
  }

  if (!siteKey) {
    if (import.meta.env.PROD) {
      console.warn(
        '[PlayMeet] App Check kapalı: VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY tanımlı değil.',
      )
    }
    return null
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
    return appCheckInstance
  } catch (error) {
    console.warn('[PlayMeet] App Check başlatılamadı:', error)
    return null
  }
}

export function getFirebaseAppCheck(): AppCheck | null {
  return appCheckInstance
}
