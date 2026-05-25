import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiAward, FiClock, FiSettings, FiVolume2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelAmbientBg } from './components/GameDuelAmbientBg'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { CandyDuelBoard } from './components/CandyDuelBoard'
import { useCandyDuel } from './useCandyDuel'
import { TARGET_SCORE } from './utils/candyDuelEngine'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

function RoundDots({ wins, max, variant }: { wins: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <span className={`pm-candy-round-dots is-${variant}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </span>
  )
}

export function CandyClashScreen() {
  const navigate = useNavigate()
  const game = useCandyDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  const progress = Math.min(100, ((game.lane1.score + game.lane2.score) / TARGET_SCORE) * 100)

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--candy">
      <div className="pm-artboard">
        <motion.div className="pm-candy-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelAmbientBg />

          <button type="button" className="pm-candy-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-candy-top-actions">
            <button type="button" className="pm-candy-icon-btn" aria-label="Ses">
              <FiVolume2 />
            </button>
            <button type="button" className="pm-candy-icon-btn" aria-label="Ayarlar">
              <FiSettings />
            </button>
          </div>

          <header className="pm-candy-header">
            <h1 className="pm-candy-header__title">
              <span className="is-cyan">NEON</span>
              <span className="is-pink">CLASH</span>
            </h1>
            <p className="pm-candy-header__sub">SKOR DÜELLOSU</p>
          </header>

          <section className="pm-candy-hud" aria-label="Oyuncu bilgileri">
            <article className={`pm-candy-hud__side is-p1 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
              <p className="pm-candy-hud__label">PLAYER 1</p>
              <p className="pm-candy-hud__score">
                <FiAward aria-hidden />
                {formatScore(game.lane1.score)}
              </p>
              <small>EN İYİ: {formatScore(game.lane1.best)}</small>
              <RoundDots wins={game.lane1.matchPoints} max={game.winRounds} variant="cyan" />
            </article>

            <div className="pm-candy-hud__center">
              <div className="pm-candy-time">
                <FiClock aria-hidden />
                <span>KALAN SÜRE</span>
                <strong>{formatTime(game.roundTimeLeft)}</strong>
              </div>
              <span className="pm-candy-vs">VS</span>
            </div>

            <article className={`pm-candy-hud__side is-p2 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
              <p className="pm-candy-hud__label">PLAYER 2</p>
              <p className="pm-candy-hud__score">
                <FiAward aria-hidden />
                {formatScore(game.lane2.score)}
              </p>
              <small>EN İYİ: {formatScore(game.lane2.best)}</small>
              <RoundDots wins={game.lane2.matchPoints} max={game.winRounds} variant="pink" />
            </article>
          </section>

          <section className="pm-candy-arena">
            <CandyDuelBoard
              lane={game.lane1}
              accent="cyan"
              interactive={game.running && !game.isRoundBreak}
              onPick={game.selectCellP1}
            />
            <div className="pm-candy-arena__mid">
              <span>VS</span>
            </div>
            <CandyDuelBoard lane={game.lane2} accent="pink" />
          </section>

          <footer className="pm-candy-footer">
            <span>TUR {game.roundNumber}/{game.matchRounds}</span>
            <div className="pm-candy-target">
              <strong>HEDEF SKOR {formatScore(TARGET_SCORE)}</strong>
              <div className="pm-candy-target__bar">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          </footer>

          {overlayMessage ? (
            <div className="pm-candy-overlay" role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={game.restartMatch}>
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
