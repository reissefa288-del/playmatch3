import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { TimePilotDuelArena } from './components/TimePilotDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useTimePilotDuel } from './useTimePilotDuel'
import { eraLabel } from './utils/timePilotDuelEngine'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function TimePilotDuelScreen() {
  const navigate = useNavigate()
  const duel = useTimePilotDuel()

  const handleBack = useCallback(() => navigate('/games/time-pilot-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--time-pilot">
      <div className="pm-artboard">
        <motion.div className="pm-tp-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-tp-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-tp-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-tp-play__stack">
            <header className="pm-tp-header">
              <h1 className="pm-tp-header__title">
                <span className="is-amber">TIME</span>
                <span className="is-sky">PILOT</span>
                <span className="is-white">DUEL</span>
              </h1>
              <p className="pm-tp-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} · {eraLabel(duel.game.p1)} ·{' '}
                {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-tp-hud">
              <div className="pm-tp-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>MAÇ {duel.game.p1.matchPoints}</span>
              </div>
              <div className="pm-tp-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-tp-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <TimePilotDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onMove={duel.moveP1}
              onFire={duel.fireP1}
              onPointerShip={duel.pointerShipP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-tp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
