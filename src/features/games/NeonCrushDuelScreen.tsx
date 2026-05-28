import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings, FiTarget } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { NeonCrushGrid } from './components/NeonCrushGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useNeonCrushDuel } from './useNeonCrushDuel'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function NeonCrushDuelScreen() {
  const navigate = useNavigate()
  const game = useNeonCrushDuel()

  const handleBack = useCallback(() => navigate('/games/neon-crush'), [navigate])
  const canPlay = game.running && !game.roundMessage

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  const targetPct = Math.min(100, Math.round((game.lane1.roundScore / game.roundTarget) * 100))

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--ncrush">
      <div className="pm-artboard">
        <motion.div className="pm-ncrush-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-ncrush-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-ncrush-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-ncrush-screen__stack">
            <header className="pm-ncrush-header">
              <h1 className="pm-ncrush-header__title">
                <span className="is-cyan">NEON</span>
                <span className="is-pink">CRUSH</span>
              </h1>
              <p className="pm-ncrush-header__sub">— DUEL —</p>
            </header>

            <section className="pm-ncrush-hud">
              <div className="pm-ncrush-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                <p className="pm-ncrush-hud__name">EMİR</p>
                <strong className="pm-ncrush-hud__score">{formatScore(game.lane1.score)}</strong>
              </div>

              <div className="pm-ncrush-hud__center">
                <div className="pm-ncrush-hud__stat">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.roundTimeLeft)}</strong>
                </div>
                <div className="pm-ncrush-hud__stat">
                  <span>ROUND</span>
                  <strong>
                    {game.roundNumber}/{game.matchRounds}
                  </strong>
                </div>
                <div className="pm-ncrush-hud__stat is-target">
                  <FiTarget aria-hidden />
                  <span>HEDEF</span>
                  <strong>{formatScore(game.roundTarget)}</strong>
                  <small>{targetPct}%</small>
                </div>
              </div>

              <div className="pm-ncrush-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
                <p className="pm-ncrush-hud__name">ZEYNEP</p>
                <strong className="pm-ncrush-hud__score">{formatScore(game.lane2.score)}</strong>
              </div>
            </section>

            <section className="pm-ncrush-arena" key={game.boardKey}>
              <div className="pm-ncrush-arena__lane">
                <NeonCrushGrid
                  lane={game.lane1}
                  accent="cyan"
                  interactive={canPlay}
                  selected={game.selected}
                  onTap={game.tapCell}
                />
              </div>
              <span className="pm-ncrush-vs" aria-hidden>
                VS
              </span>
              <div className="pm-ncrush-arena__lane">
                <NeonCrushGrid lane={game.lane2} accent="pink" />
              </div>
            </section>

            <p className="pm-ncrush-hint">Komşu taşa dokun • kaydır • eşleştir</p>
          </div>

          {overlayMessage ? (
            <motion.div className="pm-ncrush-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={game.restartMatch}>
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
