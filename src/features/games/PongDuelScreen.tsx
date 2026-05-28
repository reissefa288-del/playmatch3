import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { PongDuelArena } from './components/PongDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { usePongDuel } from './usePongDuel'

export function PongDuelScreen() {
  const navigate = useNavigate()
  const duel = usePongDuel()

  const handleBack = useCallback(() => navigate('/games/pong-duel'), [navigate])
  const canPlay = duel.running && !duel.roundMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--pong">
      <div className="pm-artboard">
        <motion.div className="pm-pong-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pong-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-pong-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-pong-screen__stack">
            <header className="pm-pong-header">
              <h1 className="pm-pong-header__title">
                <span className="is-cyan">PONG</span>
                <span className="is-pink">DUEL</span>
              </h1>
              <p className="pm-pong-header__sub">
                İLK {duel.pointsToWin} SAYI • ROUND {duel.roundNumber}/{duel.matchRounds}
              </p>
            </header>

            <section className="pm-pong-hud">
              <div className="pm-pong-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{duel.game.lane1.score}</strong>
                <span>LEG {duel.game.lane1.matchPoints}</span>
              </div>
              <div className="pm-pong-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{duel.game.lane2.score}</strong>
                <span>LEG {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            <PongDuelArena game={duel.game} interactive={canPlay} onMove={duel.movePaddle} />

            <p className="pm-pong-hint">Sahaya dokun — sol raketi hareket ettir</p>
          </div>

          {overlayMessage ? (
            <motion.div className="pm-pong-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!duel.running ? (
                <button type="button" onClick={duel.restartMatch}>
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
