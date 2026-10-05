import { useCallback, useSyncExternalStore } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import {
  completeUserOnboarding,
  getUserProfileSnapshot,
  resetUserOnboarding,
  saveUserProfileRemote,
  subscribeUserProfile,
  updateUserPhotoSlot,
} from '../profile/userProfileStore'
import type { UserProfile } from '../profile/types'

export function useUserProfile() {
  const { session } = useAuthSession()
  const { profile, loading, saving, error, source } = useSyncExternalStore(
    subscribeUserProfile,
    getUserProfileSnapshot,
    getUserProfileSnapshot,
  )

  const uid = session?.uid ?? null

  const saveProfile = useCallback(
    async (next: UserProfile) => {
      if (!uid) throw new Error('not_authenticated')
      await saveUserProfileRemote(uid, next)
    },
    [uid],
  )

  const completeOnboarding = useCallback(
    async (next: UserProfile) => {
      if (!uid) throw new Error('not_authenticated')
      await completeUserOnboarding(uid, next)
    },
    [uid],
  )

  const resetProfile = useCallback(async () => {
    if (!uid) return
    await resetUserOnboarding(uid)
  }, [uid])

  const updatePhotoSlot = useCallback(
    async (slot: number, file: File) => {
      if (!uid) throw new Error('not_authenticated')
      return updateUserPhotoSlot(uid, slot, file)
    },
    [uid],
  )

  return {
    profile,
    isOnboardingComplete: profile.onboardingCompleted,
    isProfileLoading: loading,
    isProfileSaving: saving,
    profileError: error,
    profileSource: source,
    saveProfile,
    completeOnboarding,
    resetProfile,
    updatePhotoSlot,
  }
}
