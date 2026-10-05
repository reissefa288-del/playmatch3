import type { User } from 'firebase/auth'
import { preferLocalDevPersistence } from './previewDevAuth'

const DEV_SEED_STORAGE_KEY = 'pm-auth-session'

export type AuthSession = {
  uid: string
  provider: 'google'
  acceptedTerms: true
  acceptedPrivacy: true
  signedInAt: number
  displayName: string
  email: string
  avatarUrl: string
}

export function mapFirebaseUserToSession(user: User): AuthSession {
  return {
    uid: user.uid,
    provider: 'google',
    acceptedTerms: true,
    acceptedPrivacy: true,
    signedInAt: Date.now(),
    displayName: user.displayName?.trim() || 'Oyuncu',
    email: user.email ?? '',
    avatarUrl: user.photoURL ?? '',
  }
}

/** Lighthouse / local audit only — when Firebase env is not set. */
export function readDevAuthSessionRaw(): string | null {
  try {
    return localStorage.getItem(DEV_SEED_STORAGE_KEY)
  } catch {
    return null
  }
}

export function readDevAuthSession(): AuthSession | null {
  if (!preferLocalDevPersistence()) return null
  const raw = readDevAuthSessionRaw()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed.email) return null
    return {
      uid: parsed.uid ?? 'dev-seed',
      provider: 'google',
      acceptedTerms: true,
      acceptedPrivacy: true,
      signedInAt: parsed.signedInAt ?? Date.now(),
      displayName: parsed.displayName ?? 'Oyuncu',
      email: parsed.email,
      avatarUrl: parsed.avatarUrl ?? '',
    }
  } catch {
    return null
  }
}

export function clearDevAuthSession(): void {
  try {
    localStorage.removeItem(DEV_SEED_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Firebase env yokken yerel geliştirme — gerçek Google OAuth yerine oturum seed. */
export function persistDevAuthSession(session: AuthSession): void {
  if (!preferLocalDevPersistence()) return
  try {
    localStorage.setItem(DEV_SEED_STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* ignore */
  }
}

export function createDevGoogleSession(account: {
  displayName: string
  email: string
  avatarUrl: string
}): AuthSession {
  const email = account.email.trim() || 'dev@playmeet.local'
  return {
    uid: `dev-google-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`,
    provider: 'google',
    acceptedTerms: true,
    acceptedPrivacy: true,
    signedInAt: Date.now(),
    displayName: account.displayName.trim() || 'Oyuncu',
    email,
    avatarUrl: account.avatarUrl,
  }
}
