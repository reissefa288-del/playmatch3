import '../../styles/slice-duel.css'
import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SliceDuelArena } from './components/SliceDuelArena'
import { SliceDuelHealth } from './components/SliceDuelHealth'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSliceDuel } from './useSliceDuel'
import { unlockSliceDuelAudio } from './utils/sliceDuelSounds'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function SliceDuelScreen() {
  const navigate = useNavigate()
  const duel = useSliceDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = duel.running && !duel.legPause && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--slice">
      <div className="pm-artboard">
        <motion.div
          className="pm-slice-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={() => unlockSliceDuelAudio()}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-slice-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-slice-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-slice-screen__stack">
            <header className="pm-slice-header">
              <h1 className="pm-slice-header__title">
                <span className="is-orange">SLICE</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-slice-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {duel.legDurationSec} SN • CAN + SKOR
              </p>
            </header>

            <section className="pm-slice-hud">
              <div className="pm-slice-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <SliceDuelHealth lives={duel.game.p1.lives} variant="p1" />
                <span>MAÇ {duel.game.p1.matchPoints}</span>
              </div>
              <div className="pm-slice-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
                <span>Bomba −1 can • Combo ×8 = FRENZY (+45% skor)</span>
              </div>
              <div className="pm-slice-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <SliceDuelHealth lives={duel.game.p2.lives} variant="p2" />
                <span>MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <SliceDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onSwipe={duel.swipeP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-slice-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
