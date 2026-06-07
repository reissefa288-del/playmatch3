import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import { unlockNeonCrushAudio } from './utils/neonCrushSounds'
import { FiArrowLeft, FiClock, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { NeonCrushAmbient } from './components/NeonCrushAmbient'
import { NeonCrushFinale } from './components/NeonCrushFinale'
import { NeonCrushGrid } from './components/NeonCrushGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useNeonCrushDuel } from './useNeonCrushDuel'
import { useOpponentLikeProps } from './useGameOpponent'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function NeonCrushDuelScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const game = useNeonCrushDuel()
  const audioUnlockedRef = useRef(false)

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = game.running && !game.matchMessage

  const ensureAudio = useCallback(() => {
    if (audioUnlockedRef.current) return
    audioUnlockedRef.current = true
    unlockNeonCrushAudio()
  }, [])

  const handleTapCell = useCallback(
    (index: number) => {
      ensureAudio()
      game.tapCell(index)
    },
    [ensureAudio, game.tapCell],
  )

  const p1Fx = game.lane1.fx
  const screenFxClass = p1Fx?.burst
    ? `is-impact-${p1Fx.burst.tier}`
    : (p1Fx?.combo ?? 0) >= 3
      ? 'is-impact-combo'
      : p1Fx
        ? 'is-impact-match'
        : ''

  const showFinale = !game.running && game.winner != null

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--ncrush">
      <div className="pm-artboard">
        <div
          className={[
            'pm-ncrush-screen',
            screenFxClass,
            game.isFinalRush ? 'is-final-rush' : '',
            game.pressureToast ? 'has-pressure-toast' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <GameDuelBackdrop />
          <NeonCrushAmbient />
          {screenFxClass ? <span className={`pm-ncrush-screen__flash ${screenFxClass}`} aria-hidden /> : null}

          <button type="button" className="pm-ncrush-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-ncrush-screen__stack">
            <header className="pm-ncrush-header">
              <h1 className="pm-ncrush-header__title">
                <span className="is-cyan">NEON</span>
                <span className="is-pink">CRUSH</span>
              </h1>
              <p className="pm-ncrush-header__sub">
                {game.isFinalRush ? 'SON 10 SN · ×1.25 SKOR' : '1:30 · EN YÜKSEK SKOR'}
              </p>
            </header>

            <section className="pm-ncrush-hud">
              <div className={`pm-ncrush-hud__side${game.leader === 'p1' ? ' is-leading' : ''}`}>
                <GamePlayerPortrait
                  src={FAKE_PORTRAIT_MALE}
                  variant="cyan"
                  active={game.running}
                  crown={game.leader === 'p1'}
                />
                <p className="pm-ncrush-hud__name">EMİR</p>
                <motion.strong
                  key={game.lane1.roundScore}
                  className="pm-ncrush-hud__score"
                  initial={{ scale: 1.2, filter: 'brightness(1.4)' }}
                  animate={{ scale: 1, filter: 'brightness(1)' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                >
                  {formatScore(game.lane1.roundScore)}
                </motion.strong>
              </div>

              <div className="pm-ncrush-hud__center">
                <div className={`pm-ncrush-hud__stat is-timer${game.timeLeft <= 15 ? ' is-urgent' : ''}`}>
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.timeLeft)}</strong>
                </div>
                <div className="pm-ncrush-hud__stat">
                  <FiZap aria-hidden />
                  <span>KURAL</span>
                  <strong>{game.isFinalRush ? '×1.25' : '1:30'}</strong>
                </div>
              </div>

              <div className={`pm-ncrush-hud__side is-p2${game.leader === 'p2' ? ' is-leading' : ''}`}>
                <GamePlayerPortrait
                  src={opponent.portrait}
                  variant="pink"
                  active={game.running}
                  crown={game.leader === 'p2'} {...likeProps}/>
                <p className="pm-ncrush-hud__name">ZEYNEP</p>
                <motion.strong
                  key={game.lane2.roundScore}
                  className="pm-ncrush-hud__score"
                  initial={{ scale: 1.12, filter: 'brightness(1.25)' }}
                  animate={{ scale: 1, filter: 'brightness(1)' }}
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                >
                  {formatScore(game.lane2.roundScore)}
                </motion.strong>
              </div>
            </section>

            <div className="pm-ncrush-score-race" aria-label="Canlı skor yarışı">
              <motion.span
                className="pm-ncrush-score-race__fill is-cyan"
                animate={{ width: `${game.scoreRace.p1}%` }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              />
              <motion.span
                className="pm-ncrush-score-race__fill is-pink"
                animate={{ width: `${game.scoreRace.p2}%` }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              />
              <span className="pm-ncrush-score-race__mid" aria-hidden />
            </div>

            <AnimatePresence>
              {game.pressureToast ? (
                <motion.p
                  key={game.pressureToast}
                  className="pm-ncrush-pressure-banner"
                  initial={{ opacity: 0, y: -8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="status"
                >
                  {game.pressureToast}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <section
              className={`pm-ncrush-arena${showFinale ? ' has-result' : ''}`}
              key={game.boardKey}
              onPointerDown={ensureAudio}
            >
              <div className={`pm-ncrush-arena__lane${game.pressureToast ? ' is-under-pressure' : ''}`}>
                <NeonCrushGrid
                  lane={game.lane1}
                  accent="cyan"
                  interactive={canPlay}
                  selected={game.selected}
                  onTap={handleTapCell}
                />
              </div>
              <div className="pm-ncrush-arena__lane is-opponent">
                <NeonCrushGrid lane={game.lane2} accent="pink" />
              </div>

              {showFinale ? (
                <NeonCrushFinale
                  winner={game.winner!}
                  p1Score={game.lane1.roundScore}
                  p2Score={game.lane2.roundScore}
                  opponentName={opponent.name}
                  onRestart={() => {
                    ensureAudio()
                    game.restartMatch()
                  }}
                  onExit={handleBack}
                />
              ) : null}
            </section>

            <footer className="pm-ncrush-footer">
              <div className="pm-ncrush-footer__side is-cyan">
                <span className="pm-ncrush-footer__label">SEN</span>
                <span className="pm-ncrush-footer__hint">Combo → rakibe baskı</span>
              </div>
              <p className="pm-ncrush-footer__center">4lü şerit • 5li prizma • süre bitince skor</p>
              <div className="pm-ncrush-footer__side is-pink">
                <span className="pm-ncrush-footer__label">RAKİP</span>
                <span className="pm-ncrush-footer__hint">Üst sıraya taş</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
