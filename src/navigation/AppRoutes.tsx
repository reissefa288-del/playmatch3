import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNavigation } from '../features/home/components/BottomNavigation'
import { bottomNavigation } from '../features/home/data'
import { MessageScreen } from '../features/chat/MessageScreen'
import { NearbyPlayersScreen } from '../features/home/NearbyPlayersScreen'
import { MainTabLayout } from './MainTabLayout'
import { resolveTabId } from './tabConfig'
import { STACK_TRANSITION } from './transitions'

const MESSAGE_PATH = /^\/chat\/[^/]+$/
const NEARBY_PATH = /^\/nearby$/

export function AppRoutes() {
  const location = useLocation()
  const isMessage = MESSAGE_PATH.test(location.pathname)
  const isNearby = NEARBY_PATH.test(location.pathname)
  const stackOpen = isMessage || isNearby
  const activeTabId = resolveTabId(location.pathname)

  return (
    <div className="pm-app-frame">
      <MainTabLayout />
      {!stackOpen && activeTabId ? (
        <div className={`pm-nav-dock pm-app-shell--${activeTabId}`}>
          <BottomNavigation items={bottomNavigation} activeTabId={activeTabId} />
        </div>
      ) : null}
      <AnimatePresence mode="wait">
        {stackOpen ? (
          <motion.div
            key={location.pathname}
            className="pm-stack-overlay"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={STACK_TRANSITION}
          >
            <Routes>
              {isMessage ? <Route path="/chat/:chatId" element={<MessageScreen />} /> : null}
              {isNearby ? <Route path="/nearby" element={<NearbyPlayersScreen />} /> : null}
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
