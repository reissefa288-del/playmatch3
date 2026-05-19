import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GemBalanceProvider } from './features/currency/GemBalanceProvider'
import { AppRoutes } from './navigation/AppRoutes'
import './styles/currency-ui.css'
import './styles/home-filters.css'
import './styles/home-hero-stack.css'
import './styles/notifications.css'
import './styles/home.css'
import './styles/games.css'
import './styles/match.css'
import './styles/chat.css'
import './styles/profile.css'
import './styles/premium.css'
import './styles/navigation.css'

function App() {
  return (
    <GemBalanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/chat/:chatId" element={null} />
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </GemBalanceProvider>
  )
}

export default App
