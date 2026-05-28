import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { ColorMatchGrid, ColorTargetSwatch } from './components/ColorMatchGrid'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useColorMatchDuel } from './useColorMatchDuel'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function ColorMatchDuelScreen() {
  const navigate = useNavigate()
  const game = useColorMatchDuel()

  const handleBack = useCallback(() => navigate('/games/color-match'), [navigate])
  const canPlay = game.running && !game.roundMessage

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--cmatch">
      <div className="pm-artboard">
        <motion.div className="pm-cmatch-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelBackdrop />

          <button type="button" className="pm-cmatch-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-cmatch-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <div className="pm-cmatch-screen__stack">
            <header className="pm-cmatch-header">
              <h1 className="pm-cmatch-header__title">
                <span className="is-violet">COLOR</span>
                <span className="is-gold">MATCH</span>
              </h1>
              <p className="pm-cmatch-header__sub">HEDEF RENGE DOKUN • KOMBO YAP</p>
            </header>

            <section className="pm-cmatch-hud">
              <div className="pm-cmatch-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                <p className="pm-cmatch-hud__name">EMİR</p>
                <strong className="pm-cmatch-hud__score">{formatScore(game.lane1.score)}</strong>
                <span className="pm-cmatch-hud__combo">x{game.lane1.comboMult.toFixed(1)}</span>
              </div>

              <div className="pm-cmatch-hud__center">
                <div className="pm-cmatch-hud__stat">
                  <FiClock aria-hidden />
                  <span>SÜRE</span>
                  <strong>{formatTime(game.roundTimeLeft)}</strong>
                </div>
                <div className="pm-cmatch-hud__stat">
                  <span>ROUND</span>
                  <strong>
                    {game.roundNumber}/{game.matchRounds}
                  </strong>
                </div>
                <ColorTargetSwatch key={game.targetKey} color={game.target} />
              </div>

              <div className="pm-cmatch-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
                <p className="pm-cmatch-hud__name">ZEYNEP</p>
                <strong className="pm-cmatch-hud__score">{formatScore(game.lane2.score)}</strong>
                <span className="pm-cmatch-hud__combo">x{game.lane2.comboMult.toFixed(1)}</span>
              </div>
            </section>

            <section className="pm-cmatch-arena">
              <div className="pm-cmatch-arena__lane">
                <ColorMatchGrid
                  lane={game.lane1}
                  accent="cyan"
                  interactive={canPlay}
                  onTap={game.tapP1}
                />
              </div>
              <div className="pm-cmatch-arena__lane">
                <ColorMatchGrid lane={game.lane2} accent="pink" />
              </div>
            </section>
          </div>

          {overlayMessage ? (
            <motion.div className="pm-cmatch-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
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
