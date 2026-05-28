import { motion } from 'framer-motion'
import { useCallback, useMemo } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { ReflexDuelPad } from './components/ReflexDuelPad'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useReflexDuel } from './useReflexDuel'

export function ReflexDuelScreen() {
  const navigate = useNavigate()
  const duel = useReflexDuel()

  const handleBack = useCallback(() => navigate('/games/reflex-duel'), [navigate])
  const canPlay = duel.running && !duel.legMessage

  const statusText = useMemo(() => {
    const r = duel.game.lastResult
    if (!r) return null
    if (r.winner === 'false-p1') return 'ERKEN BASTIN — ZEYNEP +1'
    if (r.winner === 'false-p2') return 'RAKİP ERKEN — SEN +1'
    if (r.winner === 1 && r.p1Ms != null) return `KAZANDIN — ${r.p1Ms} ms`
    if (r.winner === 2 && r.p2Ms != null) return `KAYBETTİN — ${r.p2Ms} ms`
    if (r.winner === 'draw') return 'ÇOK GEÇ — BERABERE'
    return null
  }, [duel.game.lastResult])

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--reflex">
      <div className="pm-artboard">
        <motion.div className="pm-reflex-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-reflex-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-reflex-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-reflex-screen__stack">
            <header className="pm-reflex-header">
              <h1 className="pm-reflex-header__title">
                <span className="is-gold">REFLEX</span>
                <span className="is-cyan">DUEL</span>
              </h1>
              <p className="pm-reflex-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • İLK {duel.pointsToWin}
              </p>
            </header>

            <section className="pm-reflex-hud">
              <div className="pm-reflex-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{duel.game.lane1.score}</strong>
                <span>MAÇ {duel.game.lane1.matchPoints}</span>
              </div>
              <div className="pm-reflex-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{duel.game.lane2.score}</strong>
                <span>MAÇ {duel.game.lane2.matchPoints}</span>
              </div>
            </section>

            {statusText ? <p className="pm-reflex-status">{statusText}</p> : <p className="pm-reflex-status is-hint">Rakip sağ — sen sol</p>}

            <ReflexDuelPad phase={duel.game.phase} disabled={!canPlay} onTap={duel.tapP1} />
          </div>

          {overlayMessage ? (
            <motion.div className="pm-reflex-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
