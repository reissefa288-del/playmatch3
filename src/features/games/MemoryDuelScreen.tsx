import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiAward, FiClock, FiRefreshCw, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelAmbientBg } from './components/GameDuelAmbientBg'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { MemoryDuelGrid } from './components/MemoryDuelGrid'
import { useMemoryDuel } from './useMemoryDuel'
import { unlockMemoryDuelAudio } from './utils/memoryDuelSounds'

const PROFILE_SCORES = { p1: 1250, p2: 980 }
const PROFILE_TROPHIES = { p1: 120, p2: 95 }

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function RoundDots({ wins, max, variant }: { wins: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <motion.div className={`pm-memory-round-dots is-${variant}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </motion.div>
  )
}

export function MemoryDuelScreen() {
  const navigate = useNavigate()
  const game = useMemoryDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const handleFlip = useCallback(
    (index: number) => {
      unlockMemoryDuelAudio()
      game.flipPlayerCard(index)
    },
    [game],
  )
  const handleRestart = useCallback(() => {
    unlockMemoryDuelAudio()
    game.restartMatch()
  }, [game])

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--memory">
      <div className="pm-artboard">
        <motion.div className="pm-memory-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelAmbientBg />

          <button type="button" className="pm-memory-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-memory-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <header className="pm-memory-header">
            <h1 className="pm-memory-header__title">
              <span className="is-cyan">MEMORY</span>
              <span className="is-pink">MATCH</span>
              <span className="is-white">DUEL</span>
            </h1>
          </header>

          <section className="pm-memory-hud" aria-label="Oyuncu bilgileri">
            <article className={`pm-memory-hud__side is-p1 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
              <motion.div className="pm-memory-hud__meta is-cyan">
                <p className="pm-memory-hud__label">OYUNCU 1</p>
                <p className="pm-memory-hud__score">PUAN: {PROFILE_SCORES.p1}</p>
              </motion.div>
              <p className="pm-memory-hud__trophy">
                <FiAward aria-hidden />
                <span>{PROFILE_TROPHIES.p1}</span>
              </p>
              <RoundDots wins={game.lane1.matchPoints} max={game.winRounds} variant="cyan" />
            </article>

            <div className="pm-memory-hud__center">
              <motion.div className="pm-memory-hud__stat">
                <FiClock aria-hidden />
                <span>SÜRE</span>
                <strong>{formatTime(game.roundTimeLeft)}</strong>
              </motion.div>
              <div className="pm-memory-hud__stat">
                <span>ROUND</span>
                <strong>
                  {game.roundNumber} / {game.matchRounds}
                </strong>
              </div>
            </div>

            <article className={`pm-memory-hud__side is-p2 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
              <motion.div className="pm-memory-hud__meta is-pink">
                <p className="pm-memory-hud__label">OYUNCU 2</p>
                <p className="pm-memory-hud__score">PUAN: {PROFILE_SCORES.p2}</p>
              </motion.div>
              <p className="pm-memory-hud__trophy">
                <FiAward aria-hidden />
                <span>{PROFILE_TROPHIES.p2}</span>
              </p>
              <RoundDots wins={game.lane2.matchPoints} max={game.winRounds} variant="pink" />
            </article>
          </section>

          <section className="pm-memory-arena">
            <MemoryDuelGrid lane={game.lane1} accent="cyan" interactive onFlip={handleFlip} />
            <MemoryDuelGrid lane={game.lane2} accent="pink" />
          </section>

          <div className="pm-memory-match-bar">
            <span>EŞLEŞME</span>
            <strong>{Math.max(game.lane1.pairsFound, game.lane2.pairsFound)}</strong>
            <span className="pm-memory-match-bar__dots">
              <i className="is-cyan" />
              <i className="is-pink" />
            </span>
          </div>

          <footer className="pm-memory-tools">
            <button type="button" className="pm-memory-tool is-restart" onClick={handleRestart}>
              <FiRefreshCw />
              <span>YENİDEN BAŞLAT</span>
            </button>
            <button type="button" className="pm-memory-tool is-hint" disabled>
              <span className="pm-memory-tool__badge">3</span>
              <span>İPUCU</span>
            </button>
            <button type="button" className="pm-memory-tool is-spy" disabled>
              <span className="pm-memory-tool__badge">1</span>
              <span>RAKİBİN KARTINI GÖR</span>
            </button>
            <button type="button" className="pm-memory-tool is-time" disabled>
              <span className="pm-memory-tool__badge">1</span>
              <span>SÜRE +15sn</span>
            </button>
            <button type="button" className="pm-memory-tool is-mult" disabled>
              <span className="pm-memory-tool__badge">1</span>
              <span>SKOR ÇARPANI x2</span>
            </button>
          </footer>

          {overlayMessage ? (
            <motion.div className="pm-memory-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={handleRestart}>
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
