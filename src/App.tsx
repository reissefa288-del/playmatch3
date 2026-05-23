import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { NearbyLikesProvider } from './features/home/NearbyLikesProvider'
import { ProfileLevelProvider } from './features/profile/ProfileLevelProvider'
import { AppRoutes } from './navigation/AppRoutes'
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
import './styles/notifications.css'
import './styles/home-ambient.css'
import './styles/brand-aaa.css'
import './styles/navbar-tray.css'
import './styles/home.css'
import './styles/games.css'
import './styles/game-portrait.css'
import './styles/xox-game.css'
import './styles/brick-break.css'
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

function App() {
  return (
    <GemBalanceProvider>
      <ProfileLevelProvider>
        <NearbyLikesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<AppRoutes />} />
            </Routes>
          </BrowserRouter>
        </NearbyLikesProvider>
      </ProfileLevelProvider>
    </GemBalanceProvider>
  )
}

export default App
