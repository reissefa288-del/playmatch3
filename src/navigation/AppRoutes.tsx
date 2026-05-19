import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { MessageScreen } from '../features/chat/MessageScreen'
import { MainTabLayout } from './MainTabLayout'
import { STACK_TRANSITION } from './transitions'

const MESSAGE_PATH = /^\/chat\/[^/]+$/

export function AppRoutes() {
  const location = useLocation()
  const isMessage = MESSAGE_PATH.test(location.pathname)

  return (
    <div className="pm-app-frame">
      <MainTabLayout hideDock={isMessage} />
      <AnimatePresence mode="wait">
        {isMessage ? (
          <motion.div
            key={location.pathname}
            className="pm-stack-overlay"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={STACK_TRANSITION}
          >
            <Routes>
              <Route path="/chat/:chatId" element={<MessageScreen />} />
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
