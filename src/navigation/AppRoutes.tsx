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
import { ColorMatchLobbyScreen } from '../features/games/ColorMatchLobbyScreen'
import { ColorMatchDuelScreen } from '../features/games/ColorMatchDuelScreen'
import { NeonCrushLobbyScreen } from '../features/games/NeonCrushLobbyScreen'
import { NeonCrushDuelScreen } from '../features/games/NeonCrushDuelScreen'
import { DartDuelLobbyScreen } from '../features/games/DartDuelLobbyScreen'
import { DartDuelScreen } from '../features/games/DartDuelScreen'
import { SnakeDuelLobbyScreen } from '../features/games/SnakeDuelLobbyScreen'
import { SnakeDuelScreen } from '../features/games/SnakeDuelScreen'
import { PongDuelLobbyScreen } from '../features/games/PongDuelLobbyScreen'
import { PongDuelScreen } from '../features/games/PongDuelScreen'
import { ReflexDuelLobbyScreen } from '../features/games/ReflexDuelLobbyScreen'
import { ReflexDuelScreen } from '../features/games/ReflexDuelScreen'
import { SimonDuelLobbyScreen } from '../features/games/SimonDuelLobbyScreen'
import { SimonDuelScreen } from '../features/games/SimonDuelScreen'
import { WhackDuelLobbyScreen } from '../features/games/WhackDuelLobbyScreen'
import { WhackDuelScreen } from '../features/games/WhackDuelScreen'
import { RhythmDuelLobbyScreen } from '../features/games/RhythmDuelLobbyScreen'
import { RhythmDuelScreen } from '../features/games/RhythmDuelScreen'
import { CatchDuelLobbyScreen } from '../features/games/CatchDuelLobbyScreen'
import { CatchDuelScreen } from '../features/games/CatchDuelScreen'
import { SliceDuelLobbyScreen } from '../features/games/SliceDuelLobbyScreen'
import { SliceDuelScreen } from '../features/games/SliceDuelScreen'
import { BasketDuelLobbyScreen } from '../features/games/BasketDuelLobbyScreen'
import { BasketDuelScreen } from '../features/games/BasketDuelScreen'
import { ChessDuelLobbyScreen } from '../features/games/ChessDuelLobbyScreen'
import { ChessDuelScreen } from '../features/games/ChessDuelScreen'
import { GalagaDuelLobbyScreen } from '../features/games/GalagaDuelLobbyScreen'
import { GalagaDuelScreen } from '../features/games/GalagaDuelScreen'
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
const COLOR_MATCH_LOBBY_PATH = /^\/games\/color-match$/
const COLOR_MATCH_PLAY_PATH = /^\/games\/color-match\/play$/
const NEON_CRUSH_LOBBY_PATH = /^\/games\/neon-crush$/
const NEON_CRUSH_PLAY_PATH = /^\/games\/neon-crush\/play$/
const DART_LOBBY_PATH = /^\/games\/dart-duel$/
const DART_PLAY_PATH = /^\/games\/dart-duel\/play$/
const SNAKE_LOBBY_PATH = /^\/games\/snake-duel$/
const SNAKE_PLAY_PATH = /^\/games\/snake-duel\/play$/
const PONG_LOBBY_PATH = /^\/games\/pong-duel$/
const PONG_PLAY_PATH = /^\/games\/pong-duel\/play$/
const REFLEX_LOBBY_PATH = /^\/games\/reflex-duel$/
const REFLEX_PLAY_PATH = /^\/games\/reflex-duel\/play$/
const SIMON_LOBBY_PATH = /^\/games\/simon-duel$/
const SIMON_PLAY_PATH = /^\/games\/simon-duel\/play$/
const WHACK_LOBBY_PATH = /^\/games\/whack-duel$/
const WHACK_PLAY_PATH = /^\/games\/whack-duel\/play$/
const RHYTHM_LOBBY_PATH = /^\/games\/rhythm-duel$/
const RHYTHM_PLAY_PATH = /^\/games\/rhythm-duel\/play$/
const CATCH_LOBBY_PATH = /^\/games\/catch-duel$/
const CATCH_PLAY_PATH = /^\/games\/catch-duel\/play$/
const SLICE_LOBBY_PATH = /^\/games\/slice-duel$/
const SLICE_PLAY_PATH = /^\/games\/slice-duel\/play$/
const BASKET_LOBBY_PATH = /^\/games\/basket-duel$/
const BASKET_PLAY_PATH = /^\/games\/basket-duel\/play$/
const CHESS_LOBBY_PATH = /^\/games\/chess-duel$/
const CHESS_PLAY_PATH = /^\/games\/chess-duel\/play$/
const GALAGA_LOBBY_PATH = /^\/games\/galaga-duel$/
const GALAGA_PLAY_PATH = /^\/games\/galaga-duel\/play$/
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
  const isColorMatchLobby = COLOR_MATCH_LOBBY_PATH.test(path)
  const isColorMatchPlay = COLOR_MATCH_PLAY_PATH.test(path)
  const isNeonCrushLobby = NEON_CRUSH_LOBBY_PATH.test(path)
  const isNeonCrushPlay = NEON_CRUSH_PLAY_PATH.test(path)
  const isDartLobby = DART_LOBBY_PATH.test(path)
  const isDartPlay = DART_PLAY_PATH.test(path)
  const isSnakeLobby = SNAKE_LOBBY_PATH.test(path)
  const isSnakePlay = SNAKE_PLAY_PATH.test(path)
  const isPongLobby = PONG_LOBBY_PATH.test(path)
  const isPongPlay = PONG_PLAY_PATH.test(path)
  const isReflexLobby = REFLEX_LOBBY_PATH.test(path)
  const isReflexPlay = REFLEX_PLAY_PATH.test(path)
  const isSimonLobby = SIMON_LOBBY_PATH.test(path)
  const isSimonPlay = SIMON_PLAY_PATH.test(path)
  const isWhackLobby = WHACK_LOBBY_PATH.test(path)
  const isWhackPlay = WHACK_PLAY_PATH.test(path)
  const isRhythmLobby = RHYTHM_LOBBY_PATH.test(path)
  const isRhythmPlay = RHYTHM_PLAY_PATH.test(path)
  const isCatchLobby = CATCH_LOBBY_PATH.test(path)
  const isCatchPlay = CATCH_PLAY_PATH.test(path)
  const isSliceLobby = SLICE_LOBBY_PATH.test(path)
  const isSlicePlay = SLICE_PLAY_PATH.test(path)
  const isBasketLobby = BASKET_LOBBY_PATH.test(path)
  const isBasketPlay = BASKET_PLAY_PATH.test(path)
  const isChessLobby = CHESS_LOBBY_PATH.test(path)
  const isChessPlay = CHESS_PLAY_PATH.test(path)
  const isGalagaLobby = GALAGA_LOBBY_PATH.test(path)
  const isGalagaPlay = GALAGA_PLAY_PATH.test(path)
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
    isColorMatchLobby ||
    isColorMatchPlay ||
    isNeonCrushLobby ||
    isNeonCrushPlay ||
    isDartLobby ||
    isDartPlay ||
    isSnakeLobby ||
    isSnakePlay ||
    isPongLobby ||
    isPongPlay ||
    isReflexLobby ||
    isReflexPlay ||
    isSimonLobby ||
    isSimonPlay ||
    isWhackLobby ||
    isWhackPlay ||
    isRhythmLobby ||
    isRhythmPlay ||
    isCatchLobby ||
    isCatchPlay ||
    isSliceLobby ||
    isSlicePlay ||
    isBasketLobby ||
    isBasketPlay ||
    isChessLobby ||
    isChessPlay ||
    isGalagaLobby ||
    isGalagaPlay
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
              {isColorMatchLobby ? (
                <Route path="/games/color-match" element={<ColorMatchLobbyScreen />} />
              ) : null}
              {isColorMatchPlay ? (
                <Route path="/games/color-match/play" element={<ColorMatchDuelScreen />} />
              ) : null}
              {isNeonCrushLobby ? (
                <Route path="/games/neon-crush" element={<NeonCrushLobbyScreen />} />
              ) : null}
              {isNeonCrushPlay ? (
                <Route path="/games/neon-crush/play" element={<NeonCrushDuelScreen />} />
              ) : null}
              {isDartLobby ? <Route path="/games/dart-duel" element={<DartDuelLobbyScreen />} /> : null}
              {isDartPlay ? <Route path="/games/dart-duel/play" element={<DartDuelScreen />} /> : null}
              {isSnakeLobby ? <Route path="/games/snake-duel" element={<SnakeDuelLobbyScreen />} /> : null}
              {isSnakePlay ? <Route path="/games/snake-duel/play" element={<SnakeDuelScreen />} /> : null}
              {isPongLobby ? <Route path="/games/pong-duel" element={<PongDuelLobbyScreen />} /> : null}
              {isPongPlay ? <Route path="/games/pong-duel/play" element={<PongDuelScreen />} /> : null}
              {isReflexLobby ? <Route path="/games/reflex-duel" element={<ReflexDuelLobbyScreen />} /> : null}
              {isReflexPlay ? <Route path="/games/reflex-duel/play" element={<ReflexDuelScreen />} /> : null}
              {isSimonLobby ? <Route path="/games/simon-duel" element={<SimonDuelLobbyScreen />} /> : null}
              {isSimonPlay ? <Route path="/games/simon-duel/play" element={<SimonDuelScreen />} /> : null}
              {isWhackLobby ? <Route path="/games/whack-duel" element={<WhackDuelLobbyScreen />} /> : null}
              {isWhackPlay ? <Route path="/games/whack-duel/play" element={<WhackDuelScreen />} /> : null}
              {isRhythmLobby ? <Route path="/games/rhythm-duel" element={<RhythmDuelLobbyScreen />} /> : null}
              {isRhythmPlay ? <Route path="/games/rhythm-duel/play" element={<RhythmDuelScreen />} /> : null}
              {isCatchLobby ? <Route path="/games/catch-duel" element={<CatchDuelLobbyScreen />} /> : null}
              {isCatchPlay ? <Route path="/games/catch-duel/play" element={<CatchDuelScreen />} /> : null}
              {isSliceLobby ? <Route path="/games/slice-duel" element={<SliceDuelLobbyScreen />} /> : null}
              {isSlicePlay ? <Route path="/games/slice-duel/play" element={<SliceDuelScreen />} /> : null}
              {isBasketLobby ? <Route path="/games/basket-duel" element={<BasketDuelLobbyScreen />} /> : null}
              {isBasketPlay ? <Route path="/games/basket-duel/play" element={<BasketDuelScreen />} /> : null}
              {isChessLobby ? <Route path="/games/chess-duel" element={<ChessDuelLobbyScreen />} /> : null}
              {isChessPlay ? <Route path="/games/chess-duel/play" element={<ChessDuelScreen />} /> : null}
              {isGalagaLobby ? <Route path="/games/galaga-duel" element={<GalagaDuelLobbyScreen />} /> : null}
              {isGalagaPlay ? <Route path="/games/galaga-duel/play" element={<GalagaDuelScreen />} /> : null}
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
