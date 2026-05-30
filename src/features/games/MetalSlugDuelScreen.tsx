import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { MetalSlugDuelArena } from './components/MetalSlugDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useMetalSlugDuel } from './useMetalSlugDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function MetalSlugDuelScreen() {
  const navigate = useNavigate()
  const duel = useMetalSlugDuel()

  const handleBack = useCallback(() => navigate('/games/metal-slug-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--metal-slug">
      <div className="pm-artboard">
        <motion.div className="pm-ms-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-ms-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-ms-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-ms-play__stack">
            <header className="pm-ms-header">
              <h1 className="pm-ms-header__title">
                <span className="is-orange">METAL</span>
                <span className="is-silver">SLUG</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-ms-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-ms-hud">
              <div className="pm-ms-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>MAÇ {duel.game.p1.matchPoints} · ☠{duel.game.p1.kills}</span>
              </div>
              <div className="pm-ms-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-ms-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <MetalSlugDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onMove={duel.moveP1}
              onJump={duel.jumpP1}
              onFire={duel.fireP1}
              onGrenade={duel.grenadeP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-ms-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
