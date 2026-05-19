import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { NearbyLikesProvider } from './features/home/NearbyLikesProvider'
import { AppRoutes } from './navigation/AppRoutes'
import './styles/currency-ui.css'
import './styles/home-filters.css'
import './styles/home-hero-stack.css'
import './styles/home-hero-aaa.css'
import './styles/home-premium-unlock.css'
import './styles/home-nearby-sheet.css'
import './styles/home-nearby-likes.css'
import './styles/home-nearby-card-aaa.css'
import './styles/home-nearby-screen.css'
import './styles/notifications.css'
import './styles/home-ambient.css'
import './styles/home.css'
import './styles/games.css'
import './styles/match.css'
import './styles/match-ambient.css'
import './styles/match-screen.css'
import './styles/match-aaa.css'
import './styles/match-toast.css'
import './styles/chat.css'
import './styles/profile.css'
import './styles/premium.css'
import './styles/navigation.css'

function App() {
  return (
    <GemBalanceProvider>
      <NearbyLikesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/chat/:chatId" element={null} />
            <Route path="*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </NearbyLikesProvider>
    </GemBalanceProvider>
  )
}

export default App
