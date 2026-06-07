import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SnakeDuelRouteFallback } from '../features/games/components/SnakeDuelRouteFallback'
import { BottomNavigation } from '../features/home/components/BottomNavigation'
import { bottomNavigation } from '../features/home/data'
import { MessageScreen } from '../features/chat/MessageScreen'
import { BlockDuelScreen } from '../features/games/BlockDuelScreen'
import { BubbleShooterScreen } from '../features/games/BubbleShooterScreen'
import { BrickBreakScreen } from '../features/games/BrickBreakScreen'
import { QuickMatchScreen } from '../features/games/QuickMatchScreen'
import { XoxGameScreen } from '../features/games/XoxGameScreen'
import { MemoryDuelScreen } from '../features/games/MemoryDuelScreen'
import { StackDuelScreen } from '../features/games/StackDuelScreen'
import { MathDuelScreen } from '../features/games/MathDuelScreen'
import { ColorMatchLobbyScreen } from '../features/games/ColorMatchLobbyScreen'
import { ColorMatchDuelScreen } from '../features/games/ColorMatchDuelScreen'
import { NeonCrushLobbyScreen } from '../features/games/NeonCrushLobbyScreen'
import { NeonCrushDuelScreen } from '../features/games/NeonCrushDuelScreen'
const SnakeDuelScreen = lazy(() =>
  import('../features/games/SnakeDuelScreen').then((m) => ({ default: m.SnakeDuelScreen })),
)
import { PongDuelScreen } from '../features/games/PongDuelScreen'
import { SimonDuelScreen } from '../features/games/SimonDuelScreen'
import { SliceDuelScreen } from '../features/games/SliceDuelScreen'
import { ChessDuelScreen } from '../features/games/ChessDuelScreen'
import { SpaceDuelLobbyScreen } from '../features/games/SpaceDuelLobbyScreen'
import { SpaceDuelScreen } from '../features/games/SpaceDuelScreen'
import { MissileCommandDuelScreen } from '../features/games/MissileCommandDuelScreen'
import { DefenderDuelScreen } from '../features/games/DefenderDuelScreen'
import { Game1942DuelScreen } from '../features/games/Game1942DuelScreen'
import { NearbyPlayersScreen } from '../features/home/NearbyPlayersScreen'
import { MainTabLayout } from './MainTabLayout'
import { resolveTabId } from './tabConfig'
import { STACK_TRANSITION } from './transitions'
import { useNavDockHeight } from './useNavDockHeight'

const MESSAGE_PATH = /^\/chat\/[^/]+$/
const NEARBY_PATH = /^\/nearby$/
const QUICK_MATCH_PATH = /^\/games\/quick-match$/
const XOX_PATH = /^\/games\/xox$/
const BRICK_PATH = /^\/games\/brick-break$/
const BUBBLE_PATH = /^\/games\/bubble-shooter$/
const BLOCK_PATH = /^\/games\/block-duel$/
const MEMORY_PATH = /^\/games\/memory-duel$/
const STACK_PATH = /^\/games\/stack-duel$/
const MATH_PATH = /^\/games\/math-duel$/
const COLOR_MATCH_LOBBY_PATH = /^\/games\/color-match$/
const COLOR_MATCH_PLAY_PATH = /^\/games\/color-match\/play$/
const NEON_CRUSH_LOBBY_PATH = /^\/games\/neon-crush$/
const NEON_CRUSH_PLAY_PATH = /^\/games\/neon-crush\/play$/
const SNAKE_LOBBY_PATH = /^\/games\/snake-duel$/
const SNAKE_PLAY_PATH = /^\/games\/snake-duel\/play$/
const PONG_PLAY_PATH = /^\/games\/pong-duel(\/play)?$/
const SIMON_PLAY_PATH = /^\/games\/simon-duel(\/play)?$/
const SLICE_PLAY_PATH = /^\/games\/slice-duel(\/play)?$/
const CHESS_PLAY_PATH = /^\/games\/chess-duel(\/play)?$/
const SPACE_PLAY_PATH = /^\/games\/space-duel(\/play)?$/
const MISSILE_PLAY_PATH = /^\/games\/missile-command-duel(\/play)?$/
const DEFENDER_PLAY_PATH = /^\/games\/defender-duel(\/play)?$/
const GAME1942_PLAY_PATH = /^\/games\/1942-duel(\/play)?$/
export function AppRoutes() {
  const location = useLocation()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const isMessage = MESSAGE_PATH.test(path)
  const isNearby = NEARBY_PATH.test(path)
  const isQuickMatch = QUICK_MATCH_PATH.test(path)
  const isXox = XOX_PATH.test(path)
  const isBrick = BRICK_PATH.test(path)
  const isBubble = BUBBLE_PATH.test(path)
  const isBlock = BLOCK_PATH.test(path)
  const isMemory = MEMORY_PATH.test(path)
  const isStack = STACK_PATH.test(path)
  const isMath = MATH_PATH.test(path)
  const isColorMatchLobby = COLOR_MATCH_LOBBY_PATH.test(path)
  const isColorMatchPlay = COLOR_MATCH_PLAY_PATH.test(path)
  const isNeonCrushLobby = NEON_CRUSH_LOBBY_PATH.test(path)
  const isNeonCrushPlay = NEON_CRUSH_PLAY_PATH.test(path)
  const isSnakeLobby = SNAKE_LOBBY_PATH.test(path)
  const isSnakePlay = SNAKE_PLAY_PATH.test(path)
  const isPongPlay = PONG_PLAY_PATH.test(path)
  const isSimonPlay = SIMON_PLAY_PATH.test(path)
  const isSlicePlay = SLICE_PLAY_PATH.test(path)
  const isChessPlay = CHESS_PLAY_PATH.test(path)
  const isSpacePlay = SPACE_PLAY_PATH.test(path)
  const isMissilePlay = MISSILE_PLAY_PATH.test(path)
  const isDefenderPlay = DEFENDER_PLAY_PATH.test(path)
  const isGame1942Play = GAME1942_PLAY_PATH.test(path)
  const stackOpen =
    isMessage ||
    isNearby ||
    isQuickMatch ||
    isXox ||
    isBrick ||
    isBubble ||
    isBlock ||
    isMemory ||
    isStack ||
    isMath ||
    isColorMatchLobby ||
    isColorMatchPlay ||
    isNeonCrushLobby ||
    isNeonCrushPlay ||
    isSnakeLobby ||
    isSnakePlay ||
    isPongPlay ||
    isSimonPlay ||
    isSlicePlay ||
    isChessPlay ||
    isSpacePlay ||
    isMissilePlay ||
    isDefenderPlay ||
    isGame1942Play
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
            key="stack-overlay"
            className="pm-stack-overlay"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={STACK_TRANSITION}
          >
            <Routes location={location}>
              <Route path="/chat/:chatId" element={<MessageScreen />} />
              <Route path="/nearby" element={<NearbyPlayersScreen />} />
              <Route path="/games/quick-match" element={<QuickMatchScreen />} />
              <Route path="/games/xox" element={<XoxGameScreen />} />
              <Route path="/games/brick-break" element={<BrickBreakScreen />} />
              <Route path="/games/bubble-shooter" element={<BubbleShooterScreen />} />
              <Route path="/games/block-duel" element={<BlockDuelScreen />} />
              <Route path="/games/memory-duel" element={<MemoryDuelScreen />} />
              <Route path="/games/stack-duel" element={<StackDuelScreen />} />
              <Route path="/games/math-duel" element={<MathDuelScreen />} />
              <Route path="/games/color-match" element={<ColorMatchLobbyScreen />} />
              <Route path="/games/color-match/play" element={<ColorMatchDuelScreen />} />
              <Route path="/games/neon-crush" element={<NeonCrushLobbyScreen />} />
              <Route path="/games/neon-crush/play" element={<NeonCrushDuelScreen />} />
              <Route path="/games/snake-duel" element={<Navigate to="/games/snake-duel/play" replace />} />
              <Route
                path="/games/snake-duel/play"
                element={
                  <Suspense fallback={<SnakeDuelRouteFallback />}>
                    <SnakeDuelScreen />
                  </Suspense>
                }
              />
              <Route path="/games/pong-duel" element={<Navigate to="/games/pong-duel/play" replace />} />
              <Route path="/games/pong-duel/play" element={<PongDuelScreen />} />
              <Route path="/games/simon-duel" element={<Navigate to="/games/simon-duel/play" replace />} />
              <Route path="/games/simon-duel/play" element={<SimonDuelScreen />} />
              <Route path="/games/slice-duel" element={<Navigate to="/games/slice-duel/play" replace />} />
              <Route path="/games/slice-duel/play" element={<SliceDuelScreen />} />
              <Route path="/games/chess-duel" element={<Navigate to="/games/chess-duel/play" replace />} />
              <Route path="/games/chess-duel/play" element={<ChessDuelScreen />} />
              <Route path="/games/galaga-duel" element={<Navigate to="/games/space-duel/play" replace />} />
              <Route path="/games/galaga-duel/play" element={<Navigate to="/games/space-duel/play" replace />} />
              <Route path="/games/space-duel" element={<SpaceDuelLobbyScreen />} />
              <Route path="/games/space-duel/play" element={<SpaceDuelScreen />} />
              <Route path="/games/missile-command-duel" element={<Navigate to="/games/missile-command-duel/play" replace />} />
              <Route path="/games/missile-command-duel/play" element={<MissileCommandDuelScreen />} />
              <Route path="/games/defender-duel" element={<DefenderDuelScreen />} />
              <Route path="/games/defender-duel/play" element={<DefenderDuelScreen />} />
              <Route path="/games/1942-duel" element={<Game1942DuelScreen />} />
              <Route path="/games/1942-duel/play" element={<Game1942DuelScreen />} />
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
