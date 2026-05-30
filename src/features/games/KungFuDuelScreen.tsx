import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { KungFuDuelArena } from './components/KungFuDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useKungFuDuel } from './useKungFuDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function KungFuDuelScreen() {
  const navigate = useNavigate()
  const duel = useKungFuDuel()

  const handleBack = useCallback(() => navigate('/games/kung-fu-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--kung-fu">
      <div className="pm-artboard">
        <motion.div className="pm-kf-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-kf-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-kf-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-kf-play__stack">
            <header className="pm-kf-header">
              <h1 className="pm-kf-header__title">
                <span className="is-gold">KUNG</span>
                <span className="is-red">FU</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-kf-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-kf-hud">
              <div className="pm-kf-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>MAÇ {duel.game.p1.matchPoints} · x{duel.game.p1.combos || 0}</span>
              </div>
              <div className="pm-kf-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-kf-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <KungFuDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              disabled={!canPlay}
              onBlock={duel.blockP1}
              onStrike={duel.strikeP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-kf-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
