import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { MissileCommandDuelArena } from './components/MissileCommandDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { aliveCities } from './utils/missileCommandDuelEngine'
import { useMissileCommandDuel } from './useMissileCommandDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function MissileCommandDuelScreen() {
  const navigate = useNavigate()
  const duel = useMissileCommandDuel()

  const handleBack = useCallback(() => navigate('/games/missile-command-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--missile">
      <div className="pm-artboard">
        <motion.div className="pm-missile-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-missile-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-missile-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-missile-play__stack">
            <header className="pm-missile-header">
              <h1 className="pm-missile-header__title">
                <span className="is-flash">MISSILE</span>
                <span className="is-base">CMD</span>
              </h1>
              <p className="pm-missile-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-missile-hud">
              <div className="pm-missile-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>
                  MAÇ {duel.game.p1.matchPoints} · ŞEHİR {aliveCities(duel.game.p1)}
                </span>
              </div>
              <div className="pm-missile-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-missile-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <MissileCommandDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onFire={duel.fireP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-missile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
