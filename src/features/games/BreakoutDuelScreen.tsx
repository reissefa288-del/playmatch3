import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { BreakoutDuelArena } from './components/BreakoutDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useBreakoutDuel } from './useBreakoutDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function BreakoutDuelScreen() {
  const navigate = useNavigate()
  const duel = useBreakoutDuel()

  const handleBack = useCallback(() => navigate('/games/breakout-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--breakout">
      <div className="pm-artboard">
        <motion.div className="pm-breakout-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-breakout-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-breakout-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-breakout-play__stack">
            <header className="pm-breakout-header">
              <h1 className="pm-breakout-header__title">
                <span className="is-neon">BREAKOUT</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-breakout-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-breakout-hud">
              <div className="pm-breakout-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>MAÇ {duel.game.p1.matchPoints} · D{duel.game.p1.wave}</span>
              </div>
              <div className="pm-breakout-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-breakout-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <BreakoutDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              disabled={!canPlay}
              onPointerPaddle={duel.pointerPaddle}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-breakout-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
