import '../../styles/simon-duel.css'
import { motion } from 'framer-motion'
import { useCallback, useMemo } from 'react'
import { FiArrowLeft, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { SimonDuelComboBadge } from './components/SimonDuelComboBadge'
import { SimonDuelPad } from './components/SimonDuelPad'
import { SimonDuelScorePop } from './components/SimonDuelScorePop'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useSimonDuel } from './useSimonDuel'
import { unlockSimonDuelAudio } from './utils/simonDuelSounds'

export function SimonDuelScreen() {
  const navigate = useNavigate()
  const duel = useSimonDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const canPlay = duel.running && !duel.legPause && !duel.legMessage
  const l1 = duel.game.lane1
  const l2 = duel.game.lane2

  const statusText = useMemo(() => {
    if (l1.phase === 'show') return 'EMİR — İZLE'
    if (l1.phase === 'input') return 'EMİR — DOKUN!'
    if (l2.phase === 'show') return 'ZEYNEP — İZLE'
    if (l2.phase === 'input') return 'ZEYNEP — DOKUN'
    if (l1.lastScoreGain > 0) return 'EMİR SERİ YAPIYOR'
    if (l2.lastScoreGain > 0) return 'ZEYNEP SERİ YAPIYOR'
    return `HEDEF ${duel.pointsToWin} PUAN • HIZ = SKOR`
  }, [duel.pointsToWin, l1, l2])

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : duel.legMessage

  const showP1Score = l1.phase === 'ready' && l1.lastScoreGain > 0
  const showP2Score = l2.phase === 'ready' && l2.lastScoreGain > 0

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--simon">
      <div className="pm-artboard">
        <motion.div
          className="pm-simon-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={() => unlockSimonDuelAudio()}
        >
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
                LEG {duel.game.roundNumber}/{duel.matchRounds} • SKOR {duel.pointsToWin}
              </p>
            </header>

            <section className="pm-simon-hud">
              <div className="pm-simon-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong>{l1.score}</strong>
                <span>MAÇ {l1.matchPoints}</span>
              </div>
              <p className="pm-simon-status">{statusText}</p>
              <div className="pm-simon-hud__side is-p2">
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={canPlay} />
                <p>ZEYNEP</p>
                <strong>{l2.score}</strong>
                <span>MAÇ {l2.matchPoints}</span>
              </div>
            </section>

            <section className="pm-simon-arena" aria-label="Simon duel alanları">
              <div className="pm-simon-zone is-p1">
                <SimonDuelComboBadge combo={l1.combo} variant="p1" />
                <SimonDuelScorePop
                  gain={l1.lastScoreGain}
                  combo={l1.combo}
                  variant="p1"
                  pulseKey={duel.p1ScorePulse}
                  visible={showP1Score}
                />
                <SimonDuelPad
                  variant="p1"
                  lanePhase={l1.phase}
                  showPad={l1.showPad}
                  showBeat={l1.showBeat}
                  showIndex={l1.showIndex}
                  lanePad={l1.highlightPad}
                  inputIndex={l1.inputIndex}
                  seqLength={l1.activeSeqLength || l1.sequence.length}
                  lastScoreGain={l1.lastScoreGain}
                  replayCount={l1.replayCount}
                  wrongFlash={l1.wrongFlashUntil > performance.now()}
                  disabled={!canPlay}
                  onTap={duel.tapP1}
                />
              </div>
              <span className="pm-simon-arena__vs" aria-hidden>
                VS
              </span>
              <div className="pm-simon-zone is-p2">
                <SimonDuelComboBadge combo={l2.combo} variant="p2" />
                <SimonDuelScorePop
                  gain={l2.lastScoreGain}
                  combo={l2.combo}
                  variant="p2"
                  pulseKey={duel.p2ScorePulse}
                  visible={showP2Score}
                />
                <SimonDuelPad
                  variant="p2"
                  lanePhase={l2.phase}
                  showPad={l2.showPad}
                  showBeat={l2.showBeat}
                  showIndex={l2.showIndex}
                  lanePad={l2.highlightPad}
                  inputIndex={l2.inputIndex}
                  seqLength={l2.activeSeqLength || l2.sequence.length}
                  lastScoreGain={l2.lastScoreGain}
                  replayCount={l2.replayCount}
                  disabled
                />
              </div>
            </section>
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
