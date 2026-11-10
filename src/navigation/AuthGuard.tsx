import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ensureDevAutoHomeSession, shouldDevPreviewJumpToHome } from '../features/auth/devPreviewHome'
import { useAuthSession } from '../features/auth/useAuthSession'

const WELCOME_PATH = '/welcome'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuthSession()
  const location = useLocation()

  if (isAuthLoading) {
    return null
  }

  if (!isAuthenticated) {
    if (shouldDevPreviewJumpToHome()) {
      ensureDevAutoHomeSession()
      return null
    }
    return <Navigate to={WELCOME_PATH} replace state={{ from: location.pathname }} />
  }

  return children
}
