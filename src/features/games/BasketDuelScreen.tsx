import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { BasketDuelCourt } from './components/BasketDuelCourt'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useBasketDuel } from './useBasketDuel'

export function BasketDuelScreen() {
  const navigate = useNavigate()
  const duel = useBasketDuel()

  const handleBack = useCallback(() => navigate('/games/basket-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage
  const isYourTurn = duel.game.turn === 1 && duel.game.phase === 'aim'

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--basket">
      <div className="pm-artboard">
        <motion.div className="pm-basket-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-basket-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-basket-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-basket-play__stack">
            <header className="pm-basket-header">
              <h1 className="pm-basket-header__title">
                <span className="is-orange">BASKET</span>
                <span className="is-court">DUEL</span>
              </h1>
              <p className="pm-basket-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • İLK {duel.pointsToWin}
              </p>
            </header>

            <section className="pm-basket-hud">
              <div className={`pm-basket-hud__side ${isYourTurn ? 'is-active' : ''}`}>
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={isYourTurn} />
                <p>EMİR</p>
                <strong>{duel.game.lane1.score}</strong>
                <span>MAÇ {duel.game.lane1.matchPoints}</span>
              </div>
              <div className={`pm-basket-hud__side is-p2 ${!isYourTurn && duel.game.phase === 'aim' ? 'is-active' : ''}`}>
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={!isYourTurn} />
                <p>ZEYNEP</p>
                <strong>{duel.game.lane2.score}</strong>
                <span>MAÇ {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            <BasketDuelCourt
              phase={duel.game.phase}
              turn={duel.game.turn}
              marker={duel.game.marker}
              lockedMarker={duel.game.lockedMarker}
              lastGrade={duel.game.lastGrade}
              lastPoints={duel.game.lastPoints}
              disabled={!canPlay}
              onShoot={duel.shootP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-basket-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
