import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { RhythmDuelArena } from './components/RhythmDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useRhythmDuel } from './useRhythmDuel'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function RhythmDuelScreen() {
  const navigate = useNavigate()
  const duel = useRhythmDuel()

  const handleBack = useCallback(() => navigate('/games/rhythm-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--rhythm">
      <div className="pm-artboard">
        <motion.div className="pm-rhythm-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-rhythm-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-rhythm-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-rhythm-screen__stack">
            <header className="pm-rhythm-header">
              <h1 className="pm-rhythm-header__title">
                <span className="is-pink">RHYTHM</span>
                <span className="is-electric">DUEL</span>
              </h1>
              <p className="pm-rhythm-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-rhythm-hud">
              <div className="pm-rhythm-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.lane1.score)}</strong>
                <span>MAÇ {duel.game.lane1.matchPoints}</span>
              </div>
              <div className="pm-rhythm-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
                <span>COMBO x{duel.game.lane1.combo}</span>
              </div>
              <div className="pm-rhythm-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.lane2.score)}</strong>
                <span>MAÇ {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            <p className="pm-rhythm-hint">Notalar çizgiye gelince renkli şeride dokun</p>

            <RhythmDuelArena
              notes={duel.game.notes}
              now={duel.now}
              lastGrade={duel.game.lane1.lastGrade}
              combo={duel.game.lane1.combo}
              disabled={!canPlay}
              onTap={duel.tapP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-rhythm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
