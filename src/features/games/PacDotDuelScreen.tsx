import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { PacDotDuelArena } from './components/PacDotDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { dotsLeft } from './utils/pacDotDuelEngine'
import { usePacDotDuel } from './usePacDotDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function PacDotDuelScreen() {
  const navigate = useNavigate()
  const duel = usePacDotDuel()

  const handleBack = useCallback(() => navigate('/games/pac-dot-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage
  const powered = duel.now < duel.game.p1.powerUntil

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--pacdot">
      <div className="pm-artboard">
        <motion.div className="pm-pacdot-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-pacdot-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-pacdot-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-pacdot-play__stack">
            <header className="pm-pacdot-header">
              <h1 className="pm-pacdot-header__title">
                <span className="is-yellow">PAC-DOT</span>
                <span className="is-blue">DUEL</span>
              </h1>
              <p className="pm-pacdot-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
                {powered ? ' • GÜÇ!' : ''}
              </p>
            </header>

            <section className="pm-pacdot-hud">
              <div className="pm-pacdot-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>
                  MAÇ {duel.game.p1.matchPoints} · {dotsLeft(duel.game.p1)} nokta
                </span>
              </div>
              <div className="pm-pacdot-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-pacdot-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <PacDotDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onMove={duel.moveP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-pacdot-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
