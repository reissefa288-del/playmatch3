import { motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import vsBadge from '../../reference/vs.png'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { MemoryDuelAmbient } from './components/MemoryDuelAmbient'
import { MemoryDuelGrid } from './components/MemoryDuelGrid'
import { useMemoryDuel } from './useMemoryDuel'
import { unlockMemoryDuelAudio } from './utils/memoryDuelSounds'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MemoryDuelScreen() {
  const navigate = useNavigate()
  const game = useMemoryDuel()

  const interact = useCallback(() => unlockMemoryDuelAudio(), [])

  useEffect(() => {
    const onPointer = () => interact()
    window.addEventListener('pointerdown', onPointer, { once: true, passive: true })
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [interact])

  const handleBack = useCallback(() => {
    interact()
    navigate(-1)
  }, [interact, navigate])
  const handleFlip = useCallback(
    (index: number) => {
      interact()
      game.flipPlayerCard(index)
    },
    [game, interact],
  )
  const handleRestart = useCallback(() => {
    interact()
    game.restartMatch()
  }, [game, interact])

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--memory">
      <div className="pm-artboard">
        <motion.div
          className="pm-memory-screen"
          style={{ height: '100%', minHeight: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <GameDuelBackdrop />
          <MemoryDuelAmbient />

          <button type="button" className="pm-memory-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-memory-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-memory-screen__stack">
            <header className="pm-memory-header">
              <h1 className="pm-memory-header__title">
                <span className="pm-memory-header__row">
                  <span className="is-cyan">MEMORY</span>
                  <span className="is-pink">MATCH</span>
                </span>
                <span className="is-white">DUEL</span>
              </h1>
            </header>

            <section className="pm-memory-hud" aria-label="Oyuncu bilgileri">
              <div className="pm-memory-hud__side is-p1">
                <div className="pm-memory-player-card is-cyan">
                  <div className="pm-memory-player-card__photo">
                    <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                  </div>
                  <div className="pm-memory-player-card__name">EMİR</div>
                </div>
                <div className="pm-memory-score-card is-cyan">
                  <span>PUAN</span>
                  <strong>{game.lane1.score}</strong>
                </div>
              </div>

              <div className="pm-memory-hud__center">
                <div className="pm-memory-mid-stat">
                  <div className="pm-memory-mid-stat__row">
                    <FiClock aria-hidden />
                    <span>SÜRE</span>
                    <strong>{formatTime(game.roundTimeLeft)}</strong>
                  </div>
                  <div className="pm-memory-mid-stat__row">
                    <span>ROUND</span>
                    <strong>
                      {game.roundNumber} / {game.matchRounds}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pm-memory-hud__side is-p2">
                <div className="pm-memory-player-card is-pink">
                  <div className="pm-memory-player-card__photo">
                    <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
                  </div>
                  <div className="pm-memory-player-card__name">ZEYNEP</div>
                </div>
                <div className="pm-memory-score-card is-pink">
                  <span>PUAN</span>
                  <strong>{game.lane2.score}</strong>
                </div>
              </div>
            </section>

            <section className="pm-memory-arena" aria-label="Oyun alanı">
              <MemoryDuelGrid lane={game.lane1} accent="cyan" interactive onFlip={handleFlip} />
              <span className="pm-memory-arena__vs-wrap" aria-hidden>
                <span className="pm-memory-arena__vs-glow" />
                <img className="pm-memory-arena__vs" src={vsBadge} alt="" />
              </span>
              <MemoryDuelGrid lane={game.lane2} accent="pink" />
            </section>

            <div className="pm-memory-match-bar">
              <span>EŞLEŞME</span>
              <strong>{Math.max(game.lane1.pairsFound, game.lane2.pairsFound)}</strong>
              <span className="pm-memory-match-bar__dots" aria-hidden>
                <i className="is-cyan" />
                <i className="is-pink" />
              </span>
            </div>

          </div>

          {overlayMessage ? (
            <motion.div
              className={`pm-memory-overlay${!game.running ? ' is-victory' : game.isRoundBreak ? ' is-round' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="status"
            >
              <span className="pm-memory-overlay__shine" aria-hidden />
              <motion.p
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              >
                {overlayMessage}
              </motion.p>
              {!game.running ? (
                <button type="button" onClick={handleRestart}>
                  Tekrar Oyna
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
