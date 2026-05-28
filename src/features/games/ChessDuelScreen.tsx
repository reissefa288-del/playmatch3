import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { ChessDuelBoard } from './components/ChessDuelBoard'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useChessDuel } from './useChessDuel'

export function ChessDuelScreen() {
  const navigate = useNavigate()
  const duel = useChessDuel()

  const handleBack = useCallback(() => navigate('/games/chess-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage
  const isYourTurn = duel.game.turn === 'w' && duel.game.phase === 'playing'

  const overlayMessage = !duel.running
    ? duel.matchWinner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.matchWinner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  const statusLine =
    duel.game.phase === 'ended'
      ? duel.game.endReason === 'checkmate'
        ? 'MAT!'
        : 'PAT'
      : duel.game.inCheck === 'w'
        ? 'ŞAH! SENİN SIRA'
        : duel.game.inCheck === 'b'
          ? 'ŞAH! RAKİP'
          : isYourTurn
            ? 'SENİN SIRA'
            : 'RAKİP DÜŞÜNÜYOR…'

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--chess">
      <div className="pm-artboard">
        <motion.div className="pm-chess-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-chess-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-chess-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-chess-play__stack">
            <header className="pm-chess-header">
              <h1 className="pm-chess-header__title">
                <span className="is-ivory">SATRANÇ</span>
                <span className="is-gold">DUEL</span>
              </h1>
              <p className="pm-chess-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • İLK {duel.winRounds}
              </p>
            </header>

            <section className="pm-chess-hud">
              <div className={`pm-chess-hud__side ${isYourTurn ? 'is-active' : ''}`}>
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={isYourTurn} />
                <p>EMİR</p>
                <span>BEYAZ</span>
                <strong>{duel.game.lane1.matchPoints}</strong>
              </div>
              <p className="pm-chess-hud__status">{statusLine}</p>
              <div className={`pm-chess-hud__side is-p2 ${!isYourTurn && duel.game.phase === 'playing' ? 'is-active' : ''}`}>
                <GamePlayerPortrait
                  src={FAKE_PORTRAIT_FEMALE}
                  variant="pink"
                  active={!isYourTurn && duel.game.phase === 'playing'}
                />
                <p>ZEYNEP</p>
                <span>SİYAH</span>
                <strong>{duel.game.lane2.matchPoints}</strong>
              </div>
            </section>

            <ChessDuelBoard
              board={duel.game.board}
              selected={duel.game.selected}
              legalTargets={duel.game.legalTargets}
              lastMove={duel.game.lastMove}
              inCheck={duel.game.inCheck === 'w'}
              disabled={!canPlay || !isYourTurn}
              onSquare={duel.tapSquare}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-chess-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
