import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { GameMatchedInvitesProvider } from './features/games/GameMatchedInvitesProvider'
import { NearbyLikesProvider } from './features/home/NearbyLikesProvider'
import { DailyLikesProvider } from './features/likes/DailyLikesProvider'
import { ProfileLevelProvider } from './features/profile/ProfileLevelProvider'
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
import './styles/notifications.css'

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
        <NearbyLikesProvider>
          <DailyLikesProvider>
            <GameMatchedInvitesProvider>{children}</GameMatchedInvitesProvider>
          </DailyLikesProvider>
        </NearbyLikesProvider>
      </ProfileLevelProvider>
    </GemBalanceProvider>
  )
}

function WelcomeRoute() {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
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
