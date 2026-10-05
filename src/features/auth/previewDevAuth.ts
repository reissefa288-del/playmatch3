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
 * Geliştirme: kayıtlı kullanıcı gibi doğrudan ana ekran (production'da kapalı).
 * Kapatmak için .env → VITE_DEV_AUTO_HOME=false
 */
export function shouldDevAutoRegisteredHome(): boolean {
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

/** Auth + profil localStorage; Firestore/API yok (önizleme / dev auto-home). */
export function preferLocalDevPersistence(): boolean {
  return !isFirebaseConfigured() || isPreviewDevAuth() || shouldDevAutoRegisteredHome()
}
