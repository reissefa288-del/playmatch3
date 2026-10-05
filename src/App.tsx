import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ensureDevAutoHomeSession, shouldDevPreviewJumpToHome } from './features/auth/devPreviewHome'
import { useAuthSession } from './features/auth/useAuthSession'
import { useUserProfile } from './features/onboarding/useUserProfile'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { GameMatchedInvitesProvider } from './features/games/GameMatchedInvitesProvider'
import { NearbyLikesProvider } from './features/home/NearbyLikesProvider'
import { DailyLikesProvider } from './features/likes/DailyLikesProvider'
import { ProfileLevelProvider } from './features/profile/ProfileLevelProvider'
import { ProfileStatsProvider } from './features/profile/ProfileStatsProvider'
import { AppRoutes } from './navigation/AppRoutes'
import { AuthGuard } from './navigation/AuthGuard'
import { OnboardingGuard } from './navigation/OnboardingGuard'
import { lazyNamed } from './shared/lazyNamed'
import './styles/shared-ui.css'
import './styles/currency-ui.css'
import './styles/navbar-tray.css'
import './styles/motion-css.css'
import './styles/navigation.css'
import './styles/brand-aaa.css'

const AuthScreen = lazyNamed(() => import('./features/auth/AuthScreen'), 'AuthScreen')
const PrivacyPolicyScreen = lazyNamed(
  () => import('./features/legal/LegalPages'),
  'PrivacyPolicyScreen',
)
const TermsOfServiceScreen = lazyNamed(
  () => import('./features/legal/LegalPages'),
  'TermsOfServiceScreen',
)
const OnboardingFlow = lazyNamed(() => import('./features/onboarding/OnboardingFlow'), 'OnboardingFlow')

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GemBalanceProvider>
      <ProfileLevelProvider>
        <ProfileStatsProvider>
        <NearbyLikesProvider>
          <DailyLikesProvider>
            <GameMatchedInvitesProvider>{children}</GameMatchedInvitesProvider>
          </DailyLikesProvider>
        </NearbyLikesProvider>
        </ProfileStatsProvider>
      </ProfileLevelProvider>
    </GemBalanceProvider>
  )
}

function DevPreviewHomeBootstrap() {
  const navigate = useNavigate()
  const location = useLocation()
  const jumped = useRef(false)

  useEffect(() => {
    if (!shouldDevPreviewJumpToHome() || jumped.current) return
    ensureDevAutoHomeSession()
    jumped.current = true
    if (location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}

function WelcomeRoute() {
  const { isAuthenticated, isAuthLoading } = useAuthSession()
  const { isOnboardingComplete, isProfileLoading } = useUserProfile()

  if (shouldDevPreviewJumpToHome()) {
    ensureDevAutoHomeSession()
    return <Navigate to="/" replace />
  }

  if (isAuthLoading || (isAuthenticated && isProfileLoading)) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={isOnboardingComplete ? '/' : '/onboarding'} replace />
  }

  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <DevPreviewHomeBootstrap />
      <Routes>
        <Route path="/welcome" element={<WelcomeRoute />} />
        <Route
          path="/legal/kullanim-kosullari"
          element={
            <Suspense fallback={null}>
              <TermsOfServiceScreen />
            </Suspense>
          }
        />
        <Route
          path="/legal/gizlilik-politikasi"
          element={
            <Suspense fallback={null}>
              <PrivacyPolicyScreen />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <AppProviders>
                <Suspense fallback={null}>
                  <OnboardingFlow />
                </Suspense>
              </AppProviders>
            </AuthGuard>
          }
        />
        <Route
          path="*"
          element={
            <AuthGuard>
              <AppProviders>
                <OnboardingGuard>
                  <AppRoutes />
                </OnboardingGuard>
              </AppProviders>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
