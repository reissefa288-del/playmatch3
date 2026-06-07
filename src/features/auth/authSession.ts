const STORAGE_KEY = 'pm-auth-session'

export type AuthSession = {
  provider: 'google'
  acceptedTerms: true
  acceptedPrivacy: true
  signedInAt: number
  displayName: string
  email: string
  avatarUrl: string
}

export function readAuthSessionRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function readAuthSession(): AuthSession | null {
  const raw = readAuthSessionRaw()
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function writeAuthSession(session: AuthSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* ignore */
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
