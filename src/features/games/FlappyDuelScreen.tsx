import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { FiArrowLeft, FiAward, FiClock, FiSettings, FiVolume2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelAmbientBg } from './components/GameDuelAmbientBg'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { FlappyDuelArena } from './components/FlappyDuelArena'
import { useFlappyDuel } from './useFlappyDuel'
import { LIVES_START } from './utils/flappyDuelEngine'
import { unlockFlappyDuelAudio } from './utils/flappyDuelSounds'

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
    <span className={`pm-flappy-hearts is-${variant}`} aria-label={`${lives} can`}>
      {Array.from({ length: LIVES_START }, (_, i) => (
        <i key={i} className={i < lives ? 'is-full' : ''} />
      ))}
    </span>
  )
}

function RoundDots({ wins, max, variant }: { wins: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <span className={`pm-flappy-round-dots is-${variant}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </span>
  )
}

export function FlappyDuelScreen() {
  const navigate = useNavigate()
  const game = useFlappyDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const interact = useCallback(() => unlockFlappyDuelAudio(), [])

  const handleFlap = useCallback(() => {
    interact()
    game.flapP1()
  }, [game, interact])

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  const totalScore = game.lane1.score + game.lane2.score
  const racePct1 = totalScore > 0 ? (game.lane1.score / totalScore) * 82 + 4 : 42
  const racePct2 = totalScore > 0 ? (game.lane2.score / totalScore) * 82 + 4 : 58

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--flappy">
      <div className="pm-artboard">
        <motion.div className="pm-flappy-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelAmbientBg />

          <button type="button" className="pm-flappy-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-flappy-top-actions">
            <button type="button" className="pm-flappy-icon-btn" aria-label="Ses">
              <FiVolume2 />
            </button>
            <button type="button" className="pm-flappy-icon-btn" aria-label="Ayarlar">
              <FiSettings />
            </button>
          </div>

          <header className="pm-flappy-header">
            <h1 className="pm-flappy-header__title">
              <span className="pm-flappy-wing" aria-hidden>
                🪽
              </span>
              <span className="is-cyan">FLAPPY</span>
              <span className="is-pink">DUEL</span>
              <span className="pm-flappy-wing is-r" aria-hidden>
                🪽
              </span>
            </h1>
          </header>

          <section className="pm-flappy-hud" aria-label="Oyuncu bilgileri">
            <article className={`pm-flappy-hud__side is-p1 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} crown />
              <div className="pm-flappy-hud__panel is-cyan">
                <p className="pm-flappy-hud__label">OYUNCU 1</p>
                <p className="pm-flappy-hud__score">
                  <FiAward aria-hidden />
                  <span>{formatScore(1250)}</span>
                </p>
                <Hearts lives={game.lane1.lives} variant="cyan" />
              </div>
              <RoundDots wins={game.lane1.matchPoints} max={game.winRounds} variant="cyan" />
            </article>

            <div className="pm-flappy-hud__center">
              <span className="pm-flappy-vs">VS</span>
              <div className="pm-flappy-hud__stat">
                <FiClock aria-hidden />
                <span>SÜRE</span>
                <strong>{formatTime(game.roundTimeLeft)}</strong>
              </div>
            </div>

            <article className={`pm-flappy-hud__side is-p2 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} crown />
              <div className="pm-flappy-hud__panel is-pink">
                <p className="pm-flappy-hud__label">OYUNCU 2</p>
                <p className="pm-flappy-hud__score">
                  <FiAward aria-hidden />
                  <span>{formatScore(980)}</span>
                </p>
                <Hearts lives={game.lane2.lives} variant="pink" />
              </div>
              <RoundDots wins={game.lane2.matchPoints} max={game.winRounds} variant="pink" />
            </article>
          </section>

          <section className="pm-flappy-playfield" aria-label="Oyun alanı">
            <FlappyDuelArena
              lane={game.lane1}
              laneRef={game.lane1Ref}
              accent="cyan"
              interactive={game.running && !game.paused && !game.isRoundBreak}
              onFlap={handleFlap}
              active={game.running && !game.paused}
            />
            <div className="pm-flappy-playfield__mid">
              <span className="pm-flappy-playfield__vs">VS</span>
              <span className="pm-flappy-playfield__hint">DOKUN · ZIPLA</span>
              <div className="pm-flappy-race" aria-hidden>
                <span className="pm-flappy-race__bird is-cyan" style={{ left: `${racePct1 * 0.85}%` }}>
                  🐦
                </span>
                <span className="pm-flappy-race__bird is-pink" style={{ left: `${racePct2 * 0.85}%` }}>
                  🐦
                </span>
                <span className="pm-flappy-race__flag">🏁</span>
              </div>
            </div>
            <FlappyDuelArena
              lane={game.lane2}
              laneRef={game.lane2Ref}
              accent="pink"
              active={game.running && !game.paused}
            />
          </section>

          <p className="pm-flappy-round-label">
            TUR {game.roundNumber} / {game.matchRounds}
          </p>

          {overlayMessage ? (
            <div className="pm-flappy-overlay" role="status">
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
