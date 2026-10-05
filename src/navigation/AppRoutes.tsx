import { Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { GameRouteFallback } from '../features/games/components/GameRouteFallback'
import { BottomNavigation } from '../features/home/components/BottomNavigation'
import { getBottomNavigationItems } from '../features/home/bottomNavigation'
import { lazyNamed } from '../shared/lazyNamed'
import { MainTabLayout } from './MainTabLayout'
import { resolveTabId } from './tabConfig'
import { useNavDockHeight } from './useNavDockHeight'
import { PushNotificationBridge } from '../features/push/PushNotificationBridge'

const MessageScreen = lazyNamed(() => import('../features/chat/MessageScreen'), 'MessageScreen')
const NearbyPlayersScreen = lazyNamed(() => import('../features/home/NearbyPlayersScreen'), 'NearbyPlayersScreen')
const QuickMatchScreen = lazyNamed(() => import('../features/games/QuickMatchScreen'), 'QuickMatchScreen')
const XoxGameScreen = lazyNamed(() => import('../features/games/XoxGameScreen'), 'XoxGameScreen')
const BrickBreakScreen = lazyNamed(() => import('../features/games/BrickBreakScreen'), 'BrickBreakScreen')
const BubbleShooterScreen = lazyNamed(() => import('../features/games/BubbleShooterScreen'), 'BubbleShooterScreen')
const BlockDuelScreen = lazyNamed(() => import('../features/games/BlockDuelScreen'), 'BlockDuelScreen')
const MemoryDuelScreen = lazyNamed(() => import('../features/games/MemoryDuelScreen'), 'MemoryDuelScreen')
const StackDuelScreen = lazyNamed(() => import('../features/games/StackDuelScreen'), 'StackDuelScreen')
const MathDuelScreen = lazyNamed(() => import('../features/games/MathDuelScreen'), 'MathDuelScreen')
const ColorMatchLobbyScreen = lazyNamed(
  () => import('../features/games/ColorMatchLobbyScreen'),
  'ColorMatchLobbyScreen',
)
const ColorMatchDuelScreen = lazyNamed(() => import('../features/games/ColorMatchDuelScreen'), 'ColorMatchDuelScreen')
const NeonCrushLobbyScreen = lazyNamed(() => import('../features/games/NeonCrushLobbyScreen'), 'NeonCrushLobbyScreen')
const NeonCrushDuelScreen = lazyNamed(() => import('../features/games/NeonCrushDuelScreen'), 'NeonCrushDuelScreen')
const SnakeDuelScreen = lazyNamed(() => import('../features/games/SnakeDuelScreen'), 'SnakeDuelScreen')
const PongDuelScreen = lazyNamed(() => import('../features/games/PongDuelScreen'), 'PongDuelScreen')
const SimonDuelScreen = lazyNamed(() => import('../features/games/SimonDuelScreen'), 'SimonDuelScreen')
const SliceDuelScreen = lazyNamed(() => import('../features/games/SliceDuelScreen'), 'SliceDuelScreen')
const ChessDuelScreen = lazyNamed(() => import('../features/games/ChessDuelScreen'), 'ChessDuelScreen')
const SpaceDuelLobbyScreen = lazyNamed(() => import('../features/games/SpaceDuelLobbyScreen'), 'SpaceDuelLobbyScreen')
const SpaceDuelScreen = lazyNamed(() => import('../features/games/SpaceDuelScreen'), 'SpaceDuelScreen')
const MissileCommandDuelScreen = lazyNamed(
  () => import('../features/games/MissileCommandDuelScreen'),
  'MissileCommandDuelScreen',
)
const DefenderDuelScreen = lazyNamed(() => import('../features/games/DefenderDuelScreen'), 'DefenderDuelScreen')
const Game1942DuelScreen = lazyNamed(() => import('../features/games/Game1942DuelScreen'), 'Game1942DuelScreen')

function LazyStackRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<GameRouteFallback />}>{children}</Suspense>
}

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
      <PushNotificationBridge />
      <MainTabLayout />
      {!stackOpen && activeTabId ? (
        <div className={`pm-nav-dock pm-app-shell--${activeTabId}`}>
          <BottomNavigation items={getBottomNavigationItems()} activeTabId={activeTabId} />
        </div>
      ) : null}
      {stackOpen ? (
          <div className="pm-stack-overlay pm-stack-overlay-enter">
            <Routes location={location}>
              <Route
                path="/chat/:chatId"
                element={
                  <LazyStackRoute>
                    <MessageScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/nearby"
                element={
                  <LazyStackRoute>
                    <NearbyPlayersScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/quick-match"
                element={
                  <LazyStackRoute>
                    <QuickMatchScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/xox"
                element={
                  <LazyStackRoute>
                    <XoxGameScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/brick-break"
                element={
                  <LazyStackRoute>
                    <BrickBreakScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/bubble-shooter"
                element={
                  <LazyStackRoute>
                    <BubbleShooterScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/block-duel"
                element={
                  <LazyStackRoute>
                    <BlockDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/memory-duel"
                element={
                  <LazyStackRoute>
                    <MemoryDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/stack-duel"
                element={
                  <LazyStackRoute>
                    <StackDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/math-duel"
                element={
                  <LazyStackRoute>
                    <MathDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/color-match"
                element={
                  <LazyStackRoute>
                    <ColorMatchLobbyScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/color-match/play"
                element={
                  <LazyStackRoute>
                    <ColorMatchDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/neon-crush"
                element={
                  <LazyStackRoute>
                    <NeonCrushLobbyScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/neon-crush/play"
                element={
                  <LazyStackRoute>
                    <NeonCrushDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/snake-duel" element={<Navigate to="/games/snake-duel/play" replace />} />
              <Route
                path="/games/snake-duel/play"
                element={
                  <LazyStackRoute>
                    <SnakeDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/pong-duel" element={<Navigate to="/games/pong-duel/play" replace />} />
              <Route
                path="/games/pong-duel/play"
                element={
                  <LazyStackRoute>
                    <PongDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/simon-duel" element={<Navigate to="/games/simon-duel/play" replace />} />
              <Route
                path="/games/simon-duel/play"
                element={
                  <LazyStackRoute>
                    <SimonDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/slice-duel" element={<Navigate to="/games/slice-duel/play" replace />} />
              <Route
                path="/games/slice-duel/play"
                element={
                  <LazyStackRoute>
                    <SliceDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/chess-duel" element={<Navigate to="/games/chess-duel/play" replace />} />
              <Route
                path="/games/chess-duel/play"
                element={
                  <LazyStackRoute>
                    <ChessDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route path="/games/galaga-duel" element={<Navigate to="/games/space-duel/play" replace />} />
              <Route path="/games/galaga-duel/play" element={<Navigate to="/games/space-duel/play" replace />} />
              <Route
                path="/games/space-duel"
                element={
                  <LazyStackRoute>
                    <SpaceDuelLobbyScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/space-duel/play"
                element={
                  <LazyStackRoute>
                    <SpaceDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/missile-command-duel"
                element={<Navigate to="/games/missile-command-duel/play" replace />}
              />
              <Route
                path="/games/missile-command-duel/play"
                element={
                  <LazyStackRoute>
                    <MissileCommandDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/defender-duel"
                element={
                  <LazyStackRoute>
                    <DefenderDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/defender-duel/play"
                element={
                  <LazyStackRoute>
                    <DefenderDuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/1942-duel"
                element={
                  <LazyStackRoute>
                    <Game1942DuelScreen />
                  </LazyStackRoute>
                }
              />
              <Route
                path="/games/1942-duel/play"
                element={
                  <LazyStackRoute>
                    <Game1942DuelScreen />
                  </LazyStackRoute>
                }
              />
            </Routes>
          </div>
        ) : null}
    </div>
  )
}
