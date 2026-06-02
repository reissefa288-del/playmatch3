import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SnakeDuelControls } from './components/SnakeDuelControls'
import { SnakeDuelGrid } from './components/SnakeDuelGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSnakeDuel } from './useSnakeDuel'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SnakeDuelScreen() {
  const navigate = useNavigate()
  const game = useSnakeDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = game.running && !game.roundMessage

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--snake">
      <div className="pm-artboard">
        <motion.div className="pm-snake-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-snake-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-snake-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-snake-screen__stack">
            <header className="pm-snake-header">
              <h1 className="pm-snake-header__title">
                <span className="is-cyan">SNAKE</span>
                <span className="is-green">DUEL</span>
              </h1>
              <p className="pm-snake-header__sub">YE • BÜYÜ • SKORU UÇUR</p>
            </header>

            <section className="pm-snake-hud">
              <div className="pm-snake-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p className="pm-snake-hud__name">EMİR</p>
                <strong>{game.lane1.score}</strong>
                <span>LEG {game.lane1.matchPoints}</span>
              </div>

              <div className="pm-snake-hud__center">
                <div className="pm-snake-hud__stat">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.roundTimeLeft)}</strong>
                </div>
                <div className="pm-snake-hud__stat">
                  <span>ROUND</span>
                  <strong>
                    {game.roundNumber}/{game.matchRounds}
                  </strong>
                </div>
              </div>

              <div className="pm-snake-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p className="pm-snake-hud__name">ZEYNEP</p>
                <strong>{game.lane2.score}</strong>
                <span>LEG {game.lane2.matchPoints}</span>
              </div>
            </section>

            <section className="pm-snake-arena">
              <SnakeDuelGrid lane={game.lane1} accent="cyan" />
              <span className="pm-snake-vs" aria-hidden>
                VS
              </span>
              <SnakeDuelGrid lane={game.lane2} accent="pink" />
            </section>

            <SnakeDuelControls disabled={!canPlay} onDirection={game.setDirection} />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-snake-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={game.restartMatch}>
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
