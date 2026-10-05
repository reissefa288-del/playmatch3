import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUserProfile } from '../features/onboarding/useUserProfile'

const ONBOARDING_PATH = '/onboarding'

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { isOnboardingComplete, isProfileLoading } = useUserProfile()

  if (isProfileLoading) {
    return null
  }

  if (!isOnboardingComplete) {
    return <Navigate to={ONBOARDING_PATH} replace />
  }

  return children
}
