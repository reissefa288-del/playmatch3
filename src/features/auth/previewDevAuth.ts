import { isFirebaseConfigured } from './firebaseApp'

/** Cursor Simple Browser / VS Code preview (iframe). */
export function isEmbeddedAppPreview(): boolean {
  if (typeof window === 'undefined') return false
  return window.self !== window.top
}

/** DEV + iframe: Firebase OAuth çalışmaz → yerel demo oturum. */
export function isPreviewDevAuth(): boolean {
  return import.meta.env.DEV && isEmbeddedAppPreview()
}

/**
 * Production / store: kayıt / welcome yok → doğrudan ana ekran (misafir oturum).
 * Kapatmak için .env → VITE_GUEST_HOME=false
 */
export function shouldGuestAutoHome(): boolean {
  if (import.meta.env.VITE_GUEST_HOME === 'false') return false
  if (import.meta.env.VITE_GUEST_HOME === 'true') return true
  return Boolean(import.meta.env.PROD)
}

/**
 * Kayıtlı kullanıcı gibi doğrudan ana ekran.
 * DEV: localhost / preview. PROD: misafir auto-home (VITE_GUEST_HOME).
 * Kapatmak için .env → VITE_DEV_AUTO_HOME=false (yalnızca DEV) veya VITE_GUEST_HOME=false
 */
export function shouldDevAutoRegisteredHome(): boolean {
  if (shouldGuestAutoHome()) return true
  if (!import.meta.env.DEV) return false
  if (import.meta.env.VITE_DEV_AUTO_HOME === 'false') return false
  if (import.meta.env.VITE_DEV_AUTO_HOME === 'true') return true
  if (isEmbeddedAppPreview()) return true
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return host === 'localhost' || host === '127.0.0.1'
  }
  return false
}

/** Auth + profil localStorage; Firestore/API yok (önizleme / guest / dev auto-home). */
export function preferLocalDevPersistence(): boolean {
  return !isFirebaseConfigured() || isPreviewDevAuth() || shouldDevAutoRegisteredHome()
}
