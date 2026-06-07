import { useCallback, useSyncExternalStore } from 'react'
import { clearAuthSession, readAuthSessionRaw, writeAuthSession, type AuthSession } from './authSession'
import { clearUserProfile, readUserProfile } from '../onboarding/onboardingProfile'

export type GoogleSignInProfile = Pick<AuthSession, 'displayName' | 'email' | 'avatarUrl'>

let listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): string | null {
  return readAuthSessionRaw()
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function useAuthSession() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const session = parseSession(raw)

  const signInWithGoogle = useCallback((profile: GoogleSignInProfile) => {
    const existing = readUserProfile()
    const keepProfile =
      existing?.onboardingCompleted === true && existing.email === profile.email

    if (!keepProfile) {
      clearUserProfile()
    }

    const next: AuthSession = {
      provider: 'google',
      acceptedTerms: true,
      acceptedPrivacy: true,
      signedInAt: Date.now(),
      displayName: profile.displayName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
    }
    writeAuthSession(next)
    emit()
  }, [])

  const signOut = useCallback(() => {
    clearAuthSession()
    clearUserProfile()
    emit()
  }, [])

  return {
    session,
    isAuthenticated: session != null,
    signInWithGoogle,
    signOut,
  }
}
