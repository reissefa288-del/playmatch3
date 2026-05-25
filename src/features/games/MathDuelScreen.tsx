import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiAward, FiClock, FiSettings, FiVolume2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelAmbientBg } from './components/GameDuelAmbientBg'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { MathDuelSide } from './components/MathDuelSide'
import { useMathDuel } from './useMathDuel'
import { LIVES_START } from './utils/mathDuelEngine'
import { unlockMathDuelAudio } from './utils/mathDuelSounds'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

function Hearts({ lives, variant }: { lives: number; variant: 'cyan' | 'pink' }) {
  return (
    <span className={`pm-math-hearts is-${variant}`} aria-label={`${lives} can`}>
      {Array.from({ length: LIVES_START }, (_, i) => (
        <i key={i} className={i < lives ? 'is-full' : ''} />
      ))}
    </span>
  )
}

function ComboBar({ combo, fill, variant }: { combo: number; fill: number; variant: 'cyan' | 'pink' }) {
  return (
    <div className={`pm-math-combo is-${variant}`}>
      <span>COMBO x{combo}</span>
      <div className="pm-math-combo__track">
        <i style={{ width: `${Math.round(fill * 100)}%` }} />
      </div>
    </div>
  )
}

function RoundDots({ wins, max, variant }: { wins: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <span className={`pm-math-round-dots is-${variant}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </span>
  )
}

export function MathDuelScreen() {
  const navigate = useNavigate()
  const game = useMathDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const interact = useCallback(() => unlockMathDuelAudio(), [])

  const handlePick = useCallback(
    (index: number) => {
      interact()
      game.answerP1(index)
    },
    [game, interact],
  )

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--math">
      <div className="pm-artboard">
        <motion.div className="pm-math-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelAmbientBg />

          <button type="button" className="pm-math-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-math-top-actions">
            <button type="button" className="pm-math-icon-btn" aria-label="Ses">
              <FiVolume2 />
            </button>
            <button type="button" className="pm-math-icon-btn" aria-label="Ayarlar">
              <FiSettings />
            </button>
          </div>

          <header className="pm-math-header">
            <h1 className="pm-math-header__title">
              <span className="is-cyan">MATH</span>
              <span className="pm-math-header__bolt" aria-hidden>
                ⚡
              </span>
              <span className="is-pink">DUEL</span>
            </h1>
            <p className="pm-math-header__round">
              ROUND {game.roundNumber} / {game.matchRounds}
            </p>
          </header>

          <section className="pm-math-hud" aria-label="Oyuncu bilgileri">
            <article className={`pm-math-hud__side is-p1 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} crown />
              <div className="pm-math-hud__panel is-cyan">
                <p className="pm-math-hud__label">OYUNCU 1</p>
                <p className="pm-math-hud__score">
                  <FiAward aria-hidden />
                  <span>{formatScore(game.lane1.score)}</span>
                </p>
                <Hearts lives={game.lane1.lives} variant="cyan" />
                <ComboBar combo={game.lane1.combo} fill={game.lane1.comboFill} variant="cyan" />
              </div>
              <RoundDots wins={game.lane1.matchPoints} max={game.winRounds} variant="cyan" />
            </article>

            <div className="pm-math-hud__center">
              <span className="pm-math-vs" aria-hidden>
                VS
              </span>
              <div className="pm-math-hud__stat">
                <FiClock aria-hidden />
                <span>SÜRE</span>
                <strong>{formatTime(game.roundTimeLeft)}</strong>
              </div>
            </div>

            <article className={`pm-math-hud__side is-p2 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} crown />
              <div className="pm-math-hud__panel is-pink">
                <p className="pm-math-hud__label">OYUNCU 2</p>
                <p className="pm-math-hud__score">
                  <FiAward aria-hidden />
                  <span>{formatScore(game.lane2.score)}</span>
                </p>
                <Hearts lives={game.lane2.lives} variant="pink" />
                <ComboBar combo={game.lane2.combo} fill={game.lane2.comboFill} variant="pink" />
              </div>
              <RoundDots wins={game.lane2.matchPoints} max={game.winRounds} variant="pink" />
            </article>
          </section>

          <section className="pm-math-arena" aria-label="İki oyuncu soru alanları">
            <MathDuelSide
              lane={game.lane1}
              problem={game.problem1}
              accent="cyan"
              interactive={game.running && !game.isRoundBreak}
              onPick={handlePick}
            />
            <span className="pm-math-arena__divider" aria-hidden>
              ⚡
            </span>
            <MathDuelSide lane={game.lane2} problem={game.problem2} accent="pink" />
          </section>

          <footer className="pm-math-footer">
            <span className="is-cyan">
              SEN <strong>{formatScore(game.lane1.score)}</strong>
            </span>
            <span className="pm-math-footer__title">TOPLAM SKOR</span>
            <span className="is-pink">
              RAKİP <strong>{formatScore(game.lane2.score)}</strong>
            </span>
          </footer>

          {overlayMessage ? (
            <div className="pm-math-overlay" role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={() => { interact(); game.restartMatch() }}>
                  YENİ MAÇ
                </button>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
