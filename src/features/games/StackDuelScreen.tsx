import { motion } from 'framer-motion'
import { useCallback } from 'react'
import {
  FiArrowLeft,
  FiArrowDown,
  FiArrowRight,
  FiChevronLeft,
  FiAward,
  FiClock,
  FiMenu,
  FiSettings,
  FiVolume2,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelAmbientBg } from './components/GameDuelAmbientBg'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { StackDuelTower } from './components/StackDuelTower'
import { useStackDuel } from './useStackDuel'
import { TARGET_SCORE } from './utils/stackDuelEngine'
import { unlockStackDuelAudio } from './utils/stackDuelSounds'

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
    <span className={`pm-stack-round-dots is-${variant}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < wins ? 'is-won' : ''} />
      ))}
    </span>
  )
}

export function StackDuelScreen() {
  const navigate = useNavigate()
  const game = useStackDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const interact = useCallback(() => unlockStackDuelAudio(), [])

  const progress = Math.min(100, (game.lane1.score / TARGET_SCORE) * 100)
  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : game.roundMessage

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--stack">
      <div className="pm-artboard">
        <motion.div className="pm-stack-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GameDuelAmbientBg />

          <button type="button" className="pm-stack-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <button type="button" className="pm-stack-settings" aria-label="Ayarlar">
            <FiSettings />
          </button>

          <header className="pm-stack-header">
            <h1 className="pm-stack-header__title">
              <span className="is-cyan">STACK</span>
              <span className="is-pink">DUEL</span>
            </h1>
          </header>

          <section className="pm-stack-hud" aria-label="Oyuncu bilgileri">
            <article className={`pm-stack-hud__side is-p1 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
              <p className="pm-stack-hud__label">OYUNCU 1</p>
              <RoundDots wins={game.matchPoints.p1} max={game.winRounds} variant="cyan" />
            </article>

            <div className="pm-stack-hud__center">
              <div className="pm-stack-hud__stat">
                <FiClock aria-hidden />
                <span>SÜRE</span>
                <strong>{formatTime(game.roundTimeLeft)}</strong>
              </div>
              <div className="pm-stack-hud__stat">
                <span>ROUND</span>
                <strong>
                  {game.roundNumber} / {game.matchRounds}
                </strong>
              </div>
            </div>

            <article className={`pm-stack-hud__side is-p2 ${game.running ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={game.running} />
              <p className="pm-stack-hud__label">OYUNCU 2</p>
              <RoundDots wins={game.matchPoints.p2} max={game.winRounds} variant="pink" />
            </article>
          </section>

          <section className="pm-stack-playfield" aria-label="Oyun alanı">
            <section className="pm-stack-arena">
              <StackDuelTower
                lane={game.lane1}
                accent="cyan"
                liveScore={game.lane1.score}
                interactive={game.running && !game.isRoundBreak}
                onLand={game.commitDropP1}
              />
              <StackDuelTower lane={game.lane2} accent="pink" liveScore={game.lane2.score} />
            </section>

            <div className="pm-stack-score-live">
              <span className="is-cyan">{formatScore(game.lane1.score)}</span>
              <span className="is-pink">{formatScore(game.lane2.score)}</span>
            </div>

            {game.running && !game.isRoundBreak ? (
              <button
                type="button"
                className="pm-stack-drop-fab"
                onPointerDown={interact}
                onClick={() => {
                  interact()
                  game.dropPlayer()
                }}
                aria-label="Bloğu bırak"
              >
                <span className="pm-stack-drop-fab__ring" aria-hidden />
                <FiArrowDown aria-hidden />
                <span>BIRAK</span>
              </button>
            ) : null}
          </section>

          <div className="pm-stack-target">
            <FiAward aria-hidden />
            <span>HEDEF SKOR</span>
            <strong>{formatScore(TARGET_SCORE)}</strong>
            <div className="pm-stack-target__bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="pm-stack-controls" role="group" aria-label="Kontroller">
            <button
              type="button"
              className="pm-stack-ctrl is-left"
              onPointerDown={interact}
              onClick={() => game.movePlayer(-1)}
              aria-label="Sola"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="pm-stack-ctrl is-drop"
              onPointerDown={(e) => {
                e.preventDefault()
                interact()
                game.dropPlayer()
              }}
              aria-label="Bırak"
            >
              <FiArrowDown />
              <span className="pm-stack-ctrl__label">BIRAK</span>
            </button>
            <button
              type="button"
              className="pm-stack-ctrl is-right"
              onPointerDown={interact}
              onClick={() => game.movePlayer(1)}
              aria-label="Sağa"
            >
              <FiArrowRight />
            </button>
          </div>

          <footer className="pm-stack-footer">
            <button type="button" className="pm-stack-footer__btn" aria-label="Sessiz">
              <FiVolume2 />
              <span>SESSİZ</span>
            </button>
            <div className="pm-stack-footer__combo">
              <span>KOMBO GÜCÜ</span>
              <div className="pm-stack-footer__combo-bar">
                <span style={{ width: '75%' }} />
              </div>
            </div>
            <button type="button" className="pm-stack-footer__btn" aria-label="Menü">
              <FiMenu />
              <span>MENÜ</span>
            </button>
          </footer>

          {overlayMessage ? (
            <motion.div className="pm-stack-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {!game.running ? (
                <button type="button" onClick={() => { interact(); game.restartMatch() }}>
                  YENİDEN BAŞLAT
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
