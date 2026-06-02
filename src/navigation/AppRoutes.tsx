import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import { SnakeDuelScreen } from '../features/games/SnakeDuelScreen'
import { PongDuelLobbyScreen } from '../features/games/PongDuelLobbyScreen'
import { PongDuelScreen } from '../features/games/PongDuelScreen'
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
import { AsteroidsDuelLobbyScreen } from '../features/games/AsteroidsDuelLobbyScreen'
import { AsteroidsDuelScreen } from '../features/games/AsteroidsDuelScreen'
import { MissileCommandDuelLobbyScreen } from '../features/games/MissileCommandDuelLobbyScreen'
import { MissileCommandDuelScreen } from '../features/games/MissileCommandDuelScreen'
import { CentipedeDuelLobbyScreen } from '../features/games/CentipedeDuelLobbyScreen'
import { CentipedeDuelScreen } from '../features/games/CentipedeDuelScreen'
import { FroggerDuelLobbyScreen } from '../features/games/FroggerDuelLobbyScreen'
import { FroggerDuelScreen } from '../features/games/FroggerDuelScreen'
import { PacDotDuelLobbyScreen } from '../features/games/PacDotDuelLobbyScreen'
import { PacDotDuelScreen } from '../features/games/PacDotDuelScreen'
import { InvadersDuelLobbyScreen } from '../features/games/InvadersDuelLobbyScreen'
import { InvadersDuelScreen } from '../features/games/InvadersDuelScreen'
import { DigDugDuelLobbyScreen } from '../features/games/DigDugDuelLobbyScreen'
import { DigDugDuelScreen } from '../features/games/DigDugDuelScreen'
import { TempestDuelLobbyScreen } from '../features/games/TempestDuelLobbyScreen'
import { TempestDuelScreen } from '../features/games/TempestDuelScreen'
import { BreakoutDuelLobbyScreen } from '../features/games/BreakoutDuelLobbyScreen'
import { BreakoutDuelScreen } from '../features/games/BreakoutDuelScreen'
import { RobotronDuelLobbyScreen } from '../features/games/RobotronDuelLobbyScreen'
import { RobotronDuelScreen } from '../features/games/RobotronDuelScreen'
import { JoustDuelLobbyScreen } from '../features/games/JoustDuelLobbyScreen'
import { JoustDuelScreen } from '../features/games/JoustDuelScreen'
import { BurgerTimeDuelLobbyScreen } from '../features/games/BurgerTimeDuelLobbyScreen'
import { BurgerTimeDuelScreen } from '../features/games/BurgerTimeDuelScreen'
import { DonkeyKongDuelLobbyScreen } from '../features/games/DonkeyKongDuelLobbyScreen'
import { DonkeyKongDuelScreen } from '../features/games/DonkeyKongDuelScreen'
import { QbertDuelLobbyScreen } from '../features/games/QbertDuelLobbyScreen'
import { QbertDuelScreen } from '../features/games/QbertDuelScreen'
import { PaperboyDuelLobbyScreen } from '../features/games/PaperboyDuelLobbyScreen'
import { PaperboyDuelScreen } from '../features/games/PaperboyDuelScreen'
import { SpyHunterDuelLobbyScreen } from '../features/games/SpyHunterDuelLobbyScreen'
import { SpyHunterDuelScreen } from '../features/games/SpyHunterDuelScreen'
import { MarbleMadnessDuelLobbyScreen } from '../features/games/MarbleMadnessDuelLobbyScreen'
import { MarbleMadnessDuelScreen } from '../features/games/MarbleMadnessDuelScreen'
import { DefenderDuelLobbyScreen } from '../features/games/DefenderDuelLobbyScreen'
import { DefenderDuelScreen } from '../features/games/DefenderDuelScreen'
import { BerzerkDuelLobbyScreen } from '../features/games/BerzerkDuelLobbyScreen'
import { BerzerkDuelScreen } from '../features/games/BerzerkDuelScreen'
import { Game1942DuelLobbyScreen } from '../features/games/Game1942DuelLobbyScreen'
import { Game1942DuelScreen } from '../features/games/Game1942DuelScreen'
import { GradiusDuelLobbyScreen } from '../features/games/GradiusDuelLobbyScreen'
import { GradiusDuelScreen } from '../features/games/GradiusDuelScreen'
import { TimePilotDuelLobbyScreen } from '../features/games/TimePilotDuelLobbyScreen'
import { TimePilotDuelScreen } from '../features/games/TimePilotDuelScreen'
import { GyrussDuelLobbyScreen } from '../features/games/GyrussDuelLobbyScreen'
import { GyrussDuelScreen } from '../features/games/GyrussDuelScreen'
import { OutRunDuelLobbyScreen } from '../features/games/OutRunDuelLobbyScreen'
import { OutRunDuelScreen } from '../features/games/OutRunDuelScreen'
import { RadRacerDuelLobbyScreen } from '../features/games/RadRacerDuelLobbyScreen'
import { RadRacerDuelScreen } from '../features/games/RadRacerDuelScreen'
import { EnduroDuelLobbyScreen } from '../features/games/EnduroDuelLobbyScreen'
import { EnduroDuelScreen } from '../features/games/EnduroDuelScreen'
import { ContraDuelLobbyScreen } from '../features/games/ContraDuelLobbyScreen'
import { ContraDuelScreen } from '../features/games/ContraDuelScreen'
import { MetalSlugDuelLobbyScreen } from '../features/games/MetalSlugDuelLobbyScreen'
import { MetalSlugDuelScreen } from '../features/games/MetalSlugDuelScreen'
import { PunchOutDuelLobbyScreen } from '../features/games/PunchOutDuelLobbyScreen'
import { PunchOutDuelScreen } from '../features/games/PunchOutDuelScreen'
import { KungFuDuelLobbyScreen } from '../features/games/KungFuDuelLobbyScreen'
import { KungFuDuelScreen } from '../features/games/KungFuDuelScreen'
import { BombermanDuelLobbyScreen } from '../features/games/BombermanDuelLobbyScreen'
import { BombermanDuelScreen } from '../features/games/BombermanDuelScreen'
import { TronDuelLobbyScreen } from '../features/games/TronDuelLobbyScreen'
import { TronDuelScreen } from '../features/games/TronDuelScreen'
import { PengoDuelLobbyScreen } from '../features/games/PengoDuelLobbyScreen'
import { PengoDuelScreen } from '../features/games/PengoDuelScreen'
import { LodeRunnerDuelLobbyScreen } from '../features/games/LodeRunnerDuelLobbyScreen'
import { LodeRunnerDuelScreen } from '../features/games/LodeRunnerDuelScreen'
import { SpaceHarrierDuelLobbyScreen } from '../features/games/SpaceHarrierDuelLobbyScreen'
import { SpaceHarrierDuelScreen } from '../features/games/SpaceHarrierDuelScreen'
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
const SNAKE_LOBBY_PATH = /^\/games\/snake-duel$/
const SNAKE_PLAY_PATH = /^\/games\/snake-duel\/play$/
const PONG_LOBBY_PATH = /^\/games\/pong-duel$/
const PONG_PLAY_PATH = /^\/games\/pong-duel\/play$/
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
const ASTEROIDS_LOBBY_PATH = /^\/games\/asteroids-duel$/
const ASTEROIDS_PLAY_PATH = /^\/games\/asteroids-duel\/play$/
const MISSILE_LOBBY_PATH = /^\/games\/missile-command-duel$/
const MISSILE_PLAY_PATH = /^\/games\/missile-command-duel\/play$/
const CENTIPEDE_LOBBY_PATH = /^\/games\/centipede-duel$/
const CENTIPEDE_PLAY_PATH = /^\/games\/centipede-duel\/play$/
const FROGGER_LOBBY_PATH = /^\/games\/frogger-duel$/
const FROGGER_PLAY_PATH = /^\/games\/frogger-duel\/play$/
const PACDOT_LOBBY_PATH = /^\/games\/pac-dot-duel$/
const PACDOT_PLAY_PATH = /^\/games\/pac-dot-duel\/play$/
const INVADERS_LOBBY_PATH = /^\/games\/invaders-duel$/
const INVADERS_PLAY_PATH = /^\/games\/invaders-duel\/play$/
const DIGDUG_LOBBY_PATH = /^\/games\/dig-dug-duel$/
const DIGDUG_PLAY_PATH = /^\/games\/dig-dug-duel\/play$/
const TEMPEST_LOBBY_PATH = /^\/games\/tempest-duel$/
const TEMPEST_PLAY_PATH = /^\/games\/tempest-duel\/play$/
const BREAKOUT_LOBBY_PATH = /^\/games\/breakout-duel$/
const BREAKOUT_PLAY_PATH = /^\/games\/breakout-duel\/play$/
const ROBOTRON_LOBBY_PATH = /^\/games\/robotron-duel$/
const ROBOTRON_PLAY_PATH = /^\/games\/robotron-duel\/play$/
const JOUST_LOBBY_PATH = /^\/games\/joust-duel$/
const JOUST_PLAY_PATH = /^\/games\/joust-duel\/play$/
const BURGER_LOBBY_PATH = /^\/games\/burger-time-duel$/
const BURGER_PLAY_PATH = /^\/games\/burger-time-duel\/play$/
const DK_LOBBY_PATH = /^\/games\/donkey-kong-duel$/
const DK_PLAY_PATH = /^\/games\/donkey-kong-duel\/play$/
const QBERT_LOBBY_PATH = /^\/games\/qbert-duel$/
const QBERT_PLAY_PATH = /^\/games\/qbert-duel\/play$/
const PAPERBOY_LOBBY_PATH = /^\/games\/paperboy-duel$/
const PAPERBOY_PLAY_PATH = /^\/games\/paperboy-duel\/play$/
const SPYHUNTER_LOBBY_PATH = /^\/games\/spy-hunter-duel$/
const SPYHUNTER_PLAY_PATH = /^\/games\/spy-hunter-duel\/play$/
const MARBLE_LOBBY_PATH = /^\/games\/marble-madness-duel$/
const MARBLE_PLAY_PATH = /^\/games\/marble-madness-duel\/play$/
const DEFENDER_LOBBY_PATH = /^\/games\/defender-duel$/
const DEFENDER_PLAY_PATH = /^\/games\/defender-duel\/play$/
const BERZERK_LOBBY_PATH = /^\/games\/berzerk-duel$/
const BERZERK_PLAY_PATH = /^\/games\/berzerk-duel\/play$/
const GAME1942_LOBBY_PATH = /^\/games\/1942-duel$/
const GAME1942_PLAY_PATH = /^\/games\/1942-duel\/play$/
const GRADIUS_LOBBY_PATH = /^\/games\/gradius-duel$/
const GRADIUS_PLAY_PATH = /^\/games\/gradius-duel\/play$/
const TIMEPILOT_LOBBY_PATH = /^\/games\/time-pilot-duel$/
const TIMEPILOT_PLAY_PATH = /^\/games\/time-pilot-duel\/play$/
const GYRUSS_LOBBY_PATH = /^\/games\/gyruss-duel$/
const GYRUSS_PLAY_PATH = /^\/games\/gyruss-duel\/play$/
const OUTRUN_LOBBY_PATH = /^\/games\/outrun-duel$/
const OUTRUN_PLAY_PATH = /^\/games\/outrun-duel\/play$/
const RADRACER_LOBBY_PATH = /^\/games\/rad-racer-duel$/
const RADRACER_PLAY_PATH = /^\/games\/rad-racer-duel\/play$/
const ENDURO_LOBBY_PATH = /^\/games\/enduro-duel$/
const ENDURO_PLAY_PATH = /^\/games\/enduro-duel\/play$/
const CONTRA_LOBBY_PATH = /^\/games\/contra-duel$/
const CONTRA_PLAY_PATH = /^\/games\/contra-duel\/play$/
const METALSLUG_LOBBY_PATH = /^\/games\/metal-slug-duel$/
const METALSLUG_PLAY_PATH = /^\/games\/metal-slug-duel\/play$/
const PUNCHOUT_LOBBY_PATH = /^\/games\/punch-out-duel$/
const PUNCHOUT_PLAY_PATH = /^\/games\/punch-out-duel\/play$/
const KUNGFU_LOBBY_PATH = /^\/games\/kung-fu-duel$/
const KUNGFU_PLAY_PATH = /^\/games\/kung-fu-duel\/play$/
const BOMBERMAN_LOBBY_PATH = /^\/games\/bomberman-duel$/
const BOMBERMAN_PLAY_PATH = /^\/games\/bomberman-duel\/play$/
const TRON_LOBBY_PATH = /^\/games\/tron-duel$/
const TRON_PLAY_PATH = /^\/games\/tron-duel\/play$/
const PENGO_LOBBY_PATH = /^\/games\/pengo-duel$/
const PENGO_PLAY_PATH = /^\/games\/pengo-duel\/play$/
const LODERUNNER_LOBBY_PATH = /^\/games\/lode-runner-duel$/
const LODERUNNER_PLAY_PATH = /^\/games\/lode-runner-duel\/play$/
const SPACEHARRIER_LOBBY_PATH = /^\/games\/space-harrier-duel$/
const SPACEHARRIER_PLAY_PATH = /^\/games\/space-harrier-duel\/play$/
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
  const isSnakeLobby = SNAKE_LOBBY_PATH.test(path)
  const isSnakePlay = SNAKE_PLAY_PATH.test(path)
  const isPongLobby = PONG_LOBBY_PATH.test(path)
  const isPongPlay = PONG_PLAY_PATH.test(path)
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
  const isAsteroidsLobby = ASTEROIDS_LOBBY_PATH.test(path)
  const isAsteroidsPlay = ASTEROIDS_PLAY_PATH.test(path)
  const isMissileLobby = MISSILE_LOBBY_PATH.test(path)
  const isMissilePlay = MISSILE_PLAY_PATH.test(path)
  const isCentipedeLobby = CENTIPEDE_LOBBY_PATH.test(path)
  const isCentipedePlay = CENTIPEDE_PLAY_PATH.test(path)
  const isFroggerLobby = FROGGER_LOBBY_PATH.test(path)
  const isFroggerPlay = FROGGER_PLAY_PATH.test(path)
  const isPacDotLobby = PACDOT_LOBBY_PATH.test(path)
  const isPacDotPlay = PACDOT_PLAY_PATH.test(path)
  const isInvadersLobby = INVADERS_LOBBY_PATH.test(path)
  const isInvadersPlay = INVADERS_PLAY_PATH.test(path)
  const isDigDugLobby = DIGDUG_LOBBY_PATH.test(path)
  const isDigDugPlay = DIGDUG_PLAY_PATH.test(path)
  const isTempestLobby = TEMPEST_LOBBY_PATH.test(path)
  const isTempestPlay = TEMPEST_PLAY_PATH.test(path)
  const isBreakoutLobby = BREAKOUT_LOBBY_PATH.test(path)
  const isBreakoutPlay = BREAKOUT_PLAY_PATH.test(path)
  const isRobotronLobby = ROBOTRON_LOBBY_PATH.test(path)
  const isRobotronPlay = ROBOTRON_PLAY_PATH.test(path)
  const isJoustLobby = JOUST_LOBBY_PATH.test(path)
  const isJoustPlay = JOUST_PLAY_PATH.test(path)
  const isBurgerTimeLobby = BURGER_LOBBY_PATH.test(path)
  const isBurgerTimePlay = BURGER_PLAY_PATH.test(path)
  const isDonkeyKongLobby = DK_LOBBY_PATH.test(path)
  const isDonkeyKongPlay = DK_PLAY_PATH.test(path)
  const isQbertLobby = QBERT_LOBBY_PATH.test(path)
  const isQbertPlay = QBERT_PLAY_PATH.test(path)
  const isPaperboyLobby = PAPERBOY_LOBBY_PATH.test(path)
  const isPaperboyPlay = PAPERBOY_PLAY_PATH.test(path)
  const isSpyHunterLobby = SPYHUNTER_LOBBY_PATH.test(path)
  const isSpyHunterPlay = SPYHUNTER_PLAY_PATH.test(path)
  const isMarbleMadnessLobby = MARBLE_LOBBY_PATH.test(path)
  const isMarbleMadnessPlay = MARBLE_PLAY_PATH.test(path)
  const isDefenderLobby = DEFENDER_LOBBY_PATH.test(path)
  const isDefenderPlay = DEFENDER_PLAY_PATH.test(path)
  const isBerzerkLobby = BERZERK_LOBBY_PATH.test(path)
  const isBerzerkPlay = BERZERK_PLAY_PATH.test(path)
  const isGame1942Lobby = GAME1942_LOBBY_PATH.test(path)
  const isGame1942Play = GAME1942_PLAY_PATH.test(path)
  const isGradiusLobby = GRADIUS_LOBBY_PATH.test(path)
  const isGradiusPlay = GRADIUS_PLAY_PATH.test(path)
  const isTimePilotLobby = TIMEPILOT_LOBBY_PATH.test(path)
  const isTimePilotPlay = TIMEPILOT_PLAY_PATH.test(path)
  const isGyrussLobby = GYRUSS_LOBBY_PATH.test(path)
  const isGyrussPlay = GYRUSS_PLAY_PATH.test(path)
  const isOutRunLobby = OUTRUN_LOBBY_PATH.test(path)
  const isOutRunPlay = OUTRUN_PLAY_PATH.test(path)
  const isRadRacerLobby = RADRACER_LOBBY_PATH.test(path)
  const isRadRacerPlay = RADRACER_PLAY_PATH.test(path)
  const isEnduroLobby = ENDURO_LOBBY_PATH.test(path)
  const isEnduroPlay = ENDURO_PLAY_PATH.test(path)
  const isContraLobby = CONTRA_LOBBY_PATH.test(path)
  const isContraPlay = CONTRA_PLAY_PATH.test(path)
  const isMetalSlugLobby = METALSLUG_LOBBY_PATH.test(path)
  const isMetalSlugPlay = METALSLUG_PLAY_PATH.test(path)
  const isPunchOutLobby = PUNCHOUT_LOBBY_PATH.test(path)
  const isPunchOutPlay = PUNCHOUT_PLAY_PATH.test(path)
  const isKungFuLobby = KUNGFU_LOBBY_PATH.test(path)
  const isKungFuPlay = KUNGFU_PLAY_PATH.test(path)
  const isBombermanLobby = BOMBERMAN_LOBBY_PATH.test(path)
  const isBombermanPlay = BOMBERMAN_PLAY_PATH.test(path)
  const isTronLobby = TRON_LOBBY_PATH.test(path)
  const isTronPlay = TRON_PLAY_PATH.test(path)
  const isPengoLobby = PENGO_LOBBY_PATH.test(path)
  const isPengoPlay = PENGO_PLAY_PATH.test(path)
  const isLodeRunnerLobby = LODERUNNER_LOBBY_PATH.test(path)
  const isLodeRunnerPlay = LODERUNNER_PLAY_PATH.test(path)
  const isSpaceHarrierLobby = SPACEHARRIER_LOBBY_PATH.test(path)
  const isSpaceHarrierPlay = SPACEHARRIER_PLAY_PATH.test(path)
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
    isSnakeLobby ||
    isSnakePlay ||
    isPongLobby ||
    isPongPlay ||
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
    isGalagaPlay ||
    isAsteroidsLobby ||
    isAsteroidsPlay ||
    isMissileLobby ||
    isMissilePlay ||
    isCentipedeLobby ||
    isCentipedePlay ||
    isFroggerLobby ||
    isFroggerPlay ||
    isPacDotLobby ||
    isPacDotPlay ||
    isInvadersLobby ||
    isInvadersPlay ||
    isDigDugLobby ||
    isDigDugPlay ||
    isTempestLobby ||
    isTempestPlay ||
    isBreakoutLobby ||
    isBreakoutPlay ||
    isRobotronLobby ||
    isRobotronPlay ||
    isJoustLobby ||
    isJoustPlay ||
    isBurgerTimeLobby ||
    isBurgerTimePlay ||
    isDonkeyKongLobby ||
    isDonkeyKongPlay ||
    isQbertLobby ||
    isQbertPlay ||
    isPaperboyLobby ||
    isPaperboyPlay ||
    isSpyHunterLobby ||
    isSpyHunterPlay ||
    isMarbleMadnessLobby ||
    isMarbleMadnessPlay ||
    isDefenderLobby ||
    isDefenderPlay ||
    isBerzerkLobby ||
    isBerzerkPlay ||
    isGame1942Lobby ||
    isGame1942Play ||
    isGradiusLobby ||
    isGradiusPlay ||
    isTimePilotLobby ||
    isTimePilotPlay ||
    isGyrussLobby ||
    isGyrussPlay ||
    isOutRunLobby ||
    isOutRunPlay ||
    isRadRacerLobby ||
    isRadRacerPlay ||
    isEnduroLobby ||
    isEnduroPlay ||
    isContraLobby ||
    isContraPlay ||
    isMetalSlugLobby ||
    isMetalSlugPlay ||
    isPunchOutLobby ||
    isPunchOutPlay ||
    isKungFuLobby ||
    isKungFuPlay ||
    isBombermanLobby ||
    isBombermanPlay ||
    isTronLobby ||
    isTronPlay ||
    isPengoLobby ||
    isPengoPlay ||
    isLodeRunnerLobby ||
    isLodeRunnerPlay ||
    isSpaceHarrierLobby ||
    isSpaceHarrierPlay
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
              <Route path="/games/snake-duel/play" element={<SnakeDuelScreen />} />
              <Route path="/games/pong-duel" element={<PongDuelLobbyScreen />} />
              <Route path="/games/pong-duel/play" element={<PongDuelScreen />} />
              <Route path="/games/simon-duel" element={<SimonDuelLobbyScreen />} />
              <Route path="/games/simon-duel/play" element={<SimonDuelScreen />} />
              <Route path="/games/whack-duel" element={<WhackDuelLobbyScreen />} />
              <Route path="/games/whack-duel/play" element={<WhackDuelScreen />} />
              <Route path="/games/rhythm-duel" element={<RhythmDuelLobbyScreen />} />
              <Route path="/games/rhythm-duel/play" element={<RhythmDuelScreen />} />
              <Route path="/games/catch-duel" element={<CatchDuelLobbyScreen />} />
              <Route path="/games/catch-duel/play" element={<CatchDuelScreen />} />
              <Route path="/games/slice-duel" element={<SliceDuelLobbyScreen />} />
              <Route path="/games/slice-duel/play" element={<SliceDuelScreen />} />
              <Route path="/games/basket-duel" element={<BasketDuelLobbyScreen />} />
              <Route path="/games/basket-duel/play" element={<BasketDuelScreen />} />
              <Route path="/games/chess-duel" element={<ChessDuelLobbyScreen />} />
              <Route path="/games/chess-duel/play" element={<ChessDuelScreen />} />
              <Route path="/games/galaga-duel" element={<GalagaDuelLobbyScreen />} />
              <Route path="/games/galaga-duel/play" element={<GalagaDuelScreen />} />
              <Route path="/games/asteroids-duel" element={<AsteroidsDuelLobbyScreen />} />
              <Route path="/games/asteroids-duel/play" element={<AsteroidsDuelScreen />} />
              <Route path="/games/missile-command-duel" element={<MissileCommandDuelLobbyScreen />} />
              <Route path="/games/missile-command-duel/play" element={<MissileCommandDuelScreen />} />
              <Route path="/games/centipede-duel" element={<CentipedeDuelLobbyScreen />} />
              <Route path="/games/centipede-duel/play" element={<CentipedeDuelScreen />} />
              <Route path="/games/frogger-duel" element={<FroggerDuelLobbyScreen />} />
              <Route path="/games/frogger-duel/play" element={<FroggerDuelScreen />} />
              <Route path="/games/pac-dot-duel" element={<PacDotDuelLobbyScreen />} />
              <Route path="/games/pac-dot-duel/play" element={<PacDotDuelScreen />} />
              <Route path="/games/invaders-duel" element={<InvadersDuelLobbyScreen />} />
              <Route path="/games/invaders-duel/play" element={<InvadersDuelScreen />} />
              <Route path="/games/dig-dug-duel" element={<DigDugDuelLobbyScreen />} />
              <Route path="/games/dig-dug-duel/play" element={<DigDugDuelScreen />} />
              <Route path="/games/tempest-duel" element={<TempestDuelLobbyScreen />} />
              <Route path="/games/tempest-duel/play" element={<TempestDuelScreen />} />
              <Route path="/games/breakout-duel" element={<BreakoutDuelLobbyScreen />} />
              <Route path="/games/breakout-duel/play" element={<BreakoutDuelScreen />} />
              <Route path="/games/robotron-duel" element={<RobotronDuelLobbyScreen />} />
              <Route path="/games/robotron-duel/play" element={<RobotronDuelScreen />} />
              <Route path="/games/joust-duel" element={<JoustDuelLobbyScreen />} />
              <Route path="/games/joust-duel/play" element={<JoustDuelScreen />} />
              <Route path="/games/burger-time-duel" element={<BurgerTimeDuelLobbyScreen />} />
              <Route path="/games/burger-time-duel/play" element={<BurgerTimeDuelScreen />} />
              <Route path="/games/donkey-kong-duel" element={<DonkeyKongDuelLobbyScreen />} />
              <Route path="/games/donkey-kong-duel/play" element={<DonkeyKongDuelScreen />} />
              <Route path="/games/qbert-duel" element={<QbertDuelLobbyScreen />} />
              <Route path="/games/qbert-duel/play" element={<QbertDuelScreen />} />
              <Route path="/games/paperboy-duel" element={<PaperboyDuelLobbyScreen />} />
              <Route path="/games/paperboy-duel/play" element={<PaperboyDuelScreen />} />
              <Route path="/games/spy-hunter-duel" element={<SpyHunterDuelLobbyScreen />} />
              <Route path="/games/spy-hunter-duel/play" element={<SpyHunterDuelScreen />} />
              <Route path="/games/marble-madness-duel" element={<MarbleMadnessDuelLobbyScreen />} />
              <Route path="/games/marble-madness-duel/play" element={<MarbleMadnessDuelScreen />} />
              <Route path="/games/defender-duel" element={<DefenderDuelLobbyScreen />} />
              <Route path="/games/defender-duel/play" element={<DefenderDuelScreen />} />
              <Route path="/games/berzerk-duel" element={<BerzerkDuelLobbyScreen />} />
              <Route path="/games/berzerk-duel/play" element={<BerzerkDuelScreen />} />
              <Route path="/games/1942-duel" element={<Game1942DuelLobbyScreen />} />
              <Route path="/games/1942-duel/play" element={<Game1942DuelScreen />} />
              <Route path="/games/gradius-duel" element={<GradiusDuelLobbyScreen />} />
              <Route path="/games/gradius-duel/play" element={<GradiusDuelScreen />} />
              <Route path="/games/time-pilot-duel" element={<TimePilotDuelLobbyScreen />} />
              <Route path="/games/time-pilot-duel/play" element={<TimePilotDuelScreen />} />
              <Route path="/games/gyruss-duel" element={<GyrussDuelLobbyScreen />} />
              <Route path="/games/gyruss-duel/play" element={<GyrussDuelScreen />} />
              <Route path="/games/outrun-duel" element={<OutRunDuelLobbyScreen />} />
              <Route path="/games/outrun-duel/play" element={<OutRunDuelScreen />} />
              <Route path="/games/rad-racer-duel" element={<RadRacerDuelLobbyScreen />} />
              <Route path="/games/rad-racer-duel/play" element={<RadRacerDuelScreen />} />
              <Route path="/games/enduro-duel" element={<EnduroDuelLobbyScreen />} />
              <Route path="/games/enduro-duel/play" element={<EnduroDuelScreen />} />
              <Route path="/games/contra-duel" element={<ContraDuelLobbyScreen />} />
              <Route path="/games/contra-duel/play" element={<ContraDuelScreen />} />
              <Route path="/games/metal-slug-duel" element={<MetalSlugDuelLobbyScreen />} />
              <Route path="/games/metal-slug-duel/play" element={<MetalSlugDuelScreen />} />
              <Route path="/games/punch-out-duel" element={<PunchOutDuelLobbyScreen />} />
              <Route path="/games/punch-out-duel/play" element={<PunchOutDuelScreen />} />
              <Route path="/games/kung-fu-duel" element={<KungFuDuelLobbyScreen />} />
              <Route path="/games/kung-fu-duel/play" element={<KungFuDuelScreen />} />
              <Route path="/games/bomberman-duel" element={<BombermanDuelLobbyScreen />} />
              <Route path="/games/bomberman-duel/play" element={<BombermanDuelScreen />} />
              <Route path="/games/tron-duel" element={<TronDuelLobbyScreen />} />
              <Route path="/games/tron-duel/play" element={<TronDuelScreen />} />
              <Route path="/games/pengo-duel" element={<PengoDuelLobbyScreen />} />
              <Route path="/games/pengo-duel/play" element={<PengoDuelScreen />} />
              <Route path="/games/lode-runner-duel" element={<LodeRunnerDuelLobbyScreen />} />
              <Route path="/games/lode-runner-duel/play" element={<LodeRunnerDuelScreen />} />
              <Route path="/games/space-harrier-duel" element={<SpaceHarrierDuelLobbyScreen />} />
              <Route path="/games/space-harrier-duel/play" element={<SpaceHarrierDuelScreen />} />
            </Routes>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
