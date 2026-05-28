import { motion } from 'framer-motion'
import { useCallback, useMemo } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SimonDuelPad } from './components/SimonDuelPad'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSimonDuel } from './useSimonDuel'

export function SimonDuelScreen() {
  const navigate = useNavigate()
  const duel = useSimonDuel()

  const handleBack = useCallback(() => navigate('/games/simon-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const statusText = useMemo(() => {
    if (duel.game.phase === 'show') return `DESEN • ${duel.game.sequence.length} ADIM`
    if (duel.game.roundWinner === 1) return 'DOĞRU SIRA — SEN +1'
    if (duel.game.roundWinner === 2) return 'HATA VEYA RAKİP — ZEYNEP +1'
    if (duel.game.lane1.mistake) return 'YANLIŞ RENK!'
    return `UZUNLUK ${duel.game.seqLength} • İLK ${duel.pointsToWin}`
  }, [duel.game])

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--simon">
      <div className="pm-artboard">
        <motion.div className="pm-simon-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-simon-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-simon-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-simon-screen__stack">
            <header className="pm-simon-header">
              <h1 className="pm-simon-header__title">
                <span className="is-magenta">SIMON</span>
                <span className="is-lime">DUEL</span>
              </h1>
              <p className="pm-simon-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • İLK {duel.pointsToWin}
              </p>
            </header>

            <section className="pm-simon-hud">
              <div className="pm-simon-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{duel.game.lane1.score}</strong>
                <span>MAÇ {duel.game.lane1.matchPoints}</span>
              </div>
              <div className="pm-simon-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{duel.game.lane2.score}</strong>
                <span>MAÇ {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            <p className="pm-simon-status">{statusText}</p>

            <SimonDuelPad
              phase={duel.game.phase}
              highlightPad={duel.game.highlightPad}
              disabled={!canPlay}
              onTap={duel.tapP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-simon-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
