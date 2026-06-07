import { useCallback, useSyncExternalStore } from 'react'
import {
  clearUserProfile,
  createEmptyProfile,
  readUserProfileRaw,
  writeUserProfile,
  type UserProfile,
} from './onboardingProfile'

let listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): string | null {
  return readUserProfileRaw()
}

function parseProfile(raw: string | null): UserProfile {
  if (!raw) return createEmptyProfile()
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return createEmptyProfile()
  }
}

export function useUserProfile() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const profile = parseProfile(raw)

  const saveProfile = useCallback((next: UserProfile) => {
    writeUserProfile(next)
    emit()
  }, [])

  const completeOnboarding = useCallback((next: UserProfile) => {
    writeUserProfile({
      ...next,
      onboardingCompleted: true,
      completedAt: Date.now(),
    })
    emit()
  }, [])

  const resetProfile = useCallback(() => {
    clearUserProfile()
    emit()
  }, [])

  return {
    profile,
    isOnboardingComplete: profile.onboardingCompleted,
    saveProfile,
    completeOnboarding,
    resetProfile,
  }
}
