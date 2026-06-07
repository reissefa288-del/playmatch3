import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SpaceDuelArena } from './components/SpaceDuelArena'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSpaceDuel } from './useSpaceDuel'
import { useOpponentLikeProps } from './useGameOpponent'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function SpaceDuelScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const duel = useSpaceDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--space">
      <div className="pm-artboard">
        <motion.div className="pm-space-screen-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-space-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-space-play__stack">
            <header className="pm-space-header">
              <h1 className="pm-space-header__title">
                <span className="is-neon">SPACE</span>
                <span className="is-star">DUEL</span>
              </h1>
              <p className="pm-space-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • {formatScore(duel.pointsToWin)} PUAN
              </p>
            </header>

            <section className="pm-space-hud">
              <div className="pm-space-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{formatScore(duel.game.p1.score)}</strong>
                <span>D{duel.game.p1.wave} • MAÇ {duel.game.p1.matchPoints}</span>
              </div>
              <div className="pm-space-hud__center">
                <FiClock aria-hidden />
                <strong>{duel.legTimeLeft}s</strong>
              </div>
              <div className="pm-space-hud__side is-p2">
                <GamePlayerPortrait src={opponent.portrait} variant="pink" active={canPlay} {...likeProps}/>
                <p>ZEYNEP</p>
                <strong>{formatScore(duel.game.p2.score)}</strong>
                <span>D{duel.game.p2.wave} • MAÇ {duel.game.p2.matchPoints}</span>
              </div>
            </section>

            <SpaceDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              disabled={!canPlay}
              onShipX={duel.setShipX}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-space-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!duel.running ? (
                <GameDuelRematchActions
                  onRestart={duel.restartMatch}
                  onExit={handleBack}
                  opponentName={opponent.name}
                />
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
