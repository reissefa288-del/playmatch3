import '../../styles/snake-duel.css'
import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SnakeDuelCinematicOverlay } from './components/SnakeDuelCinematicOverlay'
import { SnakeDuelControls } from './components/SnakeDuelControls'
import { SnakeDuelGrid } from './components/SnakeDuelGrid'
import { SnakeDuelTutorial } from './components/SnakeDuelTutorial'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSnakeDuel } from './useSnakeDuel'
import { useOpponentLikeProps } from './useGameOpponent'
import { ROUND_SECONDS } from './utils/snakeDuelEngine'
import { SNAKE_DUEL_ART } from './snakeDuelAssets'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SnakeDuelScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const game = useSnakeDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay =
    game.running && !game.roundMessage && !game.tutorialOpen && game.lane1.alive

  const isMatchEnd = !game.running && Boolean(game.winner)
  const cinematicOpen = Boolean(game.roundMessage && !game.tutorialOpen) || isMatchEnd
  const cinematicMessage =
    isMatchEnd && game.winner
      ? game.winner === 'draw'
        ? 'MAÇ BERABERE'
        : game.winner === 'p1'
          ? 'KAZANDIN!'
          : 'KAYBETTİN'
      : (game.roundMessage ?? '')

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--snake">
      <div className="pm-artboard">
        <motion.div
          className={[
            'pm-snake-screen',
            game.screenShake ? 'is-shake' : '',
            cinematicOpen ? 'is-cinematic' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={game.ensureAudio}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-snake-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-snake-screen__stack">
            <motion.header
              className="pm-snake-header"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
            >
              <h1 className="pm-snake-header__title">
                <motion.span
                  className="is-cyan"
                  animate={{
                    textShadow: [
                      '0 0 8px rgba(96,165,250,0.3)',
                      '0 0 18px rgba(96,165,250,0.55)',
                      '0 0 8px rgba(96,165,250,0.3)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  SNAKE
                </motion.span>
                <motion.span
                  className="is-green"
                  animate={{
                    textShadow: [
                      '0 0 8px rgba(84,226,145,0.25)',
                      '0 0 16px rgba(84,226,145,0.5)',
                      '0 0 8px rgba(84,226,145,0.25)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                >
                  DUEL
                </motion.span>
              </h1>
              <p className="pm-snake-header__sub">YEM · ELMAS · KENARDAN GEÇ</p>
            </motion.header>

            <motion.section
              className="pm-snake-hud"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
            >
              <div className="pm-snake-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p className="pm-snake-hud__name">EMİR</p>
                <motion.strong
                  key={game.lane1.score}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {game.lane1.score}
                </motion.strong>
                <span>
                  SET {game.lane1.matchPoints} · 💎 {game.lane1.diamondsCollected}
                </span>
              </div>

              <div className="pm-snake-hud__center">
                <div className="pm-snake-hud__stat pm-snake-hud__stat--timer">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.roundTimeLeft)}</strong>
                </div>
                <div className="pm-snake-hud__stat pm-snake-hud__stat--round">
                  <span>ROUND</span>
                  <strong>
                    {game.roundNumber}/{game.matchRounds}
                  </strong>
                </div>
              </div>

              <div className="pm-snake-hud__side is-p2">
                <GamePlayerPortrait src={opponent.portrait} variant="pink" active={canPlay} {...likeProps}/>
                <p className="pm-snake-hud__name">ZEYNEP</p>
                <motion.strong
                  key={game.lane2.score}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {game.lane2.score}
                </motion.strong>
                <span>
                  SET {game.lane2.matchPoints} · 💎 {game.lane2.diamondsCollected}
                </span>
              </div>
            </motion.section>

            <motion.section
              className="pm-snake-arena"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{
                opacity: cinematicOpen ? 0.35 : 1,
                scale: cinematicOpen ? 0.96 : 1,
                filter: cinematicOpen ? 'blur(2px) brightness(0.72)' : 'blur(0px) brightness(1)',
              }}
              transition={{ duration: 0.35 }}
            >
              <div className="pm-snake-arena__lane-wrap">
                <SnakeDuelGrid
                  lane={game.lane1}
                  accent="cyan"
                  roundElapsedSec={ROUND_SECONDS - game.roundTimeLeft}
                />
                {game.playerDeathMsg ? (
                  <p className="pm-snake-death-toast is-cyan" role="status">
                    {game.playerDeathMsg}
                  </p>
                ) : null}
              </div>
              <motion.img
                className="pm-snake-vs"
                src={SNAKE_DUEL_ART.vsBadge}
                alt=""
                aria-hidden
                animate={{
                  scale: [1, 1.08, 1],
                  filter: [
                    'drop-shadow(0 0 8px rgba(84,226,145,0.4))',
                    'drop-shadow(0 0 16px rgba(84,226,145,0.75))',
                    'drop-shadow(0 0 8px rgba(84,226,145,0.4))',
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="pm-snake-arena__lane-wrap">
                <SnakeDuelGrid
                  lane={game.lane2}
                  accent="pink"
                  roundElapsedSec={ROUND_SECONDS - game.roundTimeLeft}
                />
              </div>
            </motion.section>

            <SnakeDuelControls
              disabled={!canPlay}
              onDirection={game.setDirection}
              onInteract={game.ensureAudio}
            />
          </div>

          {game.tutorialOpen ? <SnakeDuelTutorial onDismiss={game.dismissTutorial} /> : null}

          <SnakeDuelCinematicOverlay
            open={cinematicOpen}
            isMatchEnd={isMatchEnd}
            message={cinematicMessage}
            roundNumber={game.roundNumber}
            matchRounds={game.matchRounds}
            scoreP1={game.lane1.score}
            scoreP2={game.lane2.score}
            setP1={game.lane1.matchPoints}
            setP2={game.lane2.matchPoints}
            onRestart={game.restartMatch}
            onExit={handleBack}
          />
        </motion.div>
      </div>
    </div>
  )
}
