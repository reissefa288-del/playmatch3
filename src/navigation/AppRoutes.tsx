import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNavigation } from '../features/home/components/BottomNavigation'
import { bottomNavigation } from '../features/home/data'
import { MessageScreen } from '../features/chat/MessageScreen'
import { BlockDuelScreen } from '../features/games/BlockDuelScreen'
import { BubbleShooterScreen } from '../features/games/BubbleShooterScreen'
import { BrickBreakScreen } from '../features/games/BrickBreakScreen'
import { XoxGameScreen } from '../features/games/XoxGameScreen'
import { MemoryDuelScreen } from '../features/games/MemoryDuelScreen'
import { StackDuelScreen } from '../features/games/StackDuelScreen'
import { MathDuelScreen } from '../features/games/MathDuelScreen'
import { FlappyDuelScreen } from '../features/games/FlappyDuelScreen'
import { CandyClashScreen } from '../features/games/CandyClashScreen'
import { NearbyPlayersScreen } from '../features/home/NearbyPlayersScreen'
import { MainTabLayout } from './MainTabLayout'
import { resolveTabId } from './tabConfig'
import { STACK_TRANSITION } from './transitions'
import { useNavDockHeight } from './useNavDockHeight'

const MESSAGE_PATH = /^\/chat\/[^/]+$/
const NEARBY_PATH = /^\/nearby$/
const XOX_PATH = /^\/games\/xox$/
const BRICK_PATH = /^\/games\/brick-break$/
const BUBBLE_PATH = /^\/games\/bubble-shooter$/
const BLOCK_PATH = /^\/games\/block-duel$/
const MEMORY_PATH = /^\/games\/memory-duel$/
const STACK_PATH = /^\/games\/stack-duel$/
const MATH_PATH = /^\/games\/math-duel$/
const FLAPPY_PATH = /^\/games\/flappy-duel$/
const CANDY_PATH = /^\/games\/candy-clash$/
export function AppRoutes() {
  const location = useLocation()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const isMessage = MESSAGE_PATH.test(path)
  const isNearby = NEARBY_PATH.test(path)
  const isXox = XOX_PATH.test(path)
  const isBrick = BRICK_PATH.test(path)
  const isBubble = BUBBLE_PATH.test(path)
  const isBlock = BLOCK_PATH.test(path)
  const isMemory = MEMORY_PATH.test(path)
  const isStack = STACK_PATH.test(path)
  const isMath = MATH_PATH.test(path)
  const isFlappy = FLAPPY_PATH.test(path)
  const isCandy = CANDY_PATH.test(path)
  const stackOpen =
    isMessage ||
    isNearby ||
    isXox ||
    isBrick ||
    isBubble ||
    isBlock ||
    isMemory ||
    isStack ||
    isMath ||
    isFlappy ||
    isCandy
  const activeTabId = resolveTabId(location.pathname)

  useNavDockHeight(!stackOpen && Boolean(activeTabId))

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
              {isXox ? <Route path="/games/xox" element={<XoxGameScreen />} /> : null}
              {isBrick ? <Route path="/games/brick-break" element={<BrickBreakScreen />} /> : null}
              {isBubble ? <Route path="/games/bubble-shooter" element={<BubbleShooterScreen />} /> : null}
              {isBlock ? <Route path="/games/block-duel" element={<BlockDuelScreen />} /> : null}
              {isMemory ? <Route path="/games/memory-duel" element={<MemoryDuelScreen />} /> : null}
              {isStack ? <Route path="/games/stack-duel" element={<StackDuelScreen />} /> : null}
              {isMath ? <Route path="/games/math-duel" element={<MathDuelScreen />} /> : null}
              {isFlappy ? <Route path="/games/flappy-duel" element={<FlappyDuelScreen />} /> : null}
              {isCandy ? <Route path="/games/candy-clash" element={<CandyClashScreen />} /> : null}
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
