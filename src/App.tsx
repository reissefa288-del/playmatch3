import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthScreen } from './features/auth/AuthScreen'
import { PrivacyPolicyScreen, TermsOfServiceScreen } from './features/legal/LegalPages'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { GameMatchedInvitesProvider } from './features/games/GameMatchedInvitesProvider'
import { NearbyLikesProvider } from './features/home/NearbyLikesProvider'
import { DailyLikesProvider } from './features/likes/DailyLikesProvider'
import { ProfileLevelProvider } from './features/profile/ProfileLevelProvider'
import { OnboardingFlow } from './features/onboarding/OnboardingFlow'
import { AppRoutes } from './navigation/AppRoutes'
import { AuthGuard } from './navigation/AuthGuard'
import { OnboardingGuard } from './navigation/OnboardingGuard'
import './styles/currency-ui.css'
import './styles/home-filters.css'
import './styles/home-hero-stack.css'
import './styles/home-hero-aaa.css'
import './styles/home-hero-actions.css'
import './styles/home-premium-unlock.css'
import './styles/home-nearby-sheet.css'
import './styles/home-nearby-likes.css'
import './styles/home-nearby-card-aaa.css'
import './styles/home-nearby-screen.css'
import './styles/home-nearby-ambient.css'
import './styles/notifications.css'
import './styles/home-ambient.css'
import './styles/brand-aaa.css'
import './styles/navbar-tray.css'
import './styles/home.css'
import './styles/games.css'
import './styles/games-quick-match.css'
import './styles/games-invite-sheet.css'
import './styles/game-duel-rematch.css'
import './styles/game-portrait.css'
import './styles/game-duel-ambient.css'
import './styles/game-duel-video.css'
import './styles/xox-game.css'
import './styles/brick-break.css'
import './styles/bubble-shooter.css'
import './styles/block-duel.css'
import './styles/math-duel.css'
import './styles/color-match.css'
import './styles/neon-crush.css'
import './styles/pong-duel.css'
import './styles/simon-duel.css'
import './styles/slice-duel.css'
import './styles/chess-duel.css'
import './styles/space-duel.css'
import './styles/missile-command-duel.css'
import './styles/defender-duel.css'
import './styles/1942-duel.css'
import './styles/memory-duel.css'
import './styles/stack-duel.css'
import './styles/match.css'
import './styles/match-ambient.css'
import './styles/match-screen.css'
import './styles/match-aaa.css'
import './styles/match-toast.css'
import './styles/chat-ambient.css'
import './styles/chat.css'
import './styles/message-ambient.css'
import './styles/message-screen.css'
import './styles/message-final.css'
import './styles/profile.css'
import './styles/profile-ambient.css'
import './styles/photo-lightbox.css'
import './styles/premium.css'
import './styles/premium-feature-icons.css'
import './styles/navigation.css'
import './styles/auth.css'
import './styles/auth-aaa.css'
import './styles/google-auth.css'
import './styles/legal.css'
import './styles/onboarding.css'

function WelcomeRoute() {
  return <AuthScreen />
}

function App() {
  return (
    <GemBalanceProvider>
      <ProfileLevelProvider>
        <NearbyLikesProvider>
          <DailyLikesProvider>
          <GameMatchedInvitesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/welcome" element={<WelcomeRoute />} />
              <Route path="/legal/kullanim-kosullari" element={<TermsOfServiceScreen />} />
              <Route path="/legal/gizlilik-politikasi" element={<PrivacyPolicyScreen />} />
              <Route
                path="/onboarding"
                element={
                  <AuthGuard>
                    <OnboardingFlow />
                  </AuthGuard>
                }
              />
              <Route
                path="*"
                element={
                  <AuthGuard>
                    <OnboardingGuard>
                      <AppRoutes />
                    </OnboardingGuard>
                  </AuthGuard>
                }
              />
            </Routes>
          </BrowserRouter>
          </GameMatchedInvitesProvider>
          </DailyLikesProvider>
        </NearbyLikesProvider>
      </ProfileLevelProvider>
    </GemBalanceProvider>
  )
}

export default App
