import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { WhackDuelGrid } from './components/WhackDuelGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useWhackDuel } from './useWhackDuel'

export function WhackDuelScreen() {
  const navigate = useNavigate()
  const duel = useWhackDuel()

  const handleBack = useCallback(() => navigate('/games/whack-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--whack">
      <div className="pm-artboard">
        <motion.div className="pm-whack-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-whack-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-whack-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-whack-screen__stack">
            <header className="pm-whack-header">
              <h1 className="pm-whack-header__title">
                <span className="is-amber">WHACK</span>
                <span className="is-teal">DUEL</span>
              </h1>
              <p className="pm-whack-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • İLK {duel.pointsToWin}
              </p>
            </header>

            <section className="pm-whack-hud">
              <div className="pm-whack-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{duel.game.lane1.score}</strong>
                <span>MAÇ {duel.game.lane1.matchPoints}</span>
              </div>
              <div className="pm-whack-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{duel.game.lane2.score}</strong>
                <span>MAÇ {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            <p className="pm-whack-status">Çıkan kafaya dokun — boş delik sayılmaz</p>

            <WhackDuelGrid
              activeCell={duel.game.lane1.activeCell}
              lastHitCell={duel.game.lane1.lastHitCell}
              disabled={!canPlay}
              onWhack={duel.whackP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-whack-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
