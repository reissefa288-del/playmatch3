import { isEmbeddedAppPreview } from './previewDevAuth'

/** Redirect OAuth state lives in sessionStorage — blocked in private / partitioned contexts. */
export function canUseRedirectAuthStorage(): boolean {
  if (typeof window === 'undefined') return false
  if (isEmbeddedAppPreview()) return false

  try {
    const key = '__pm_auth_redirect_probe__'
    sessionStorage.setItem(key, '1')
    sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function redirectAuthBlockedMessage(): string {
  return 'Tam sayfa Google girişi bu tarayıcıda çalışmıyor (gizli sekme veya site verisi kapalı). Chrome’da normal pencerede aç, handler sekmesini kapat, popup ile tekrar dene.'
}
