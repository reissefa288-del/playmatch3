import '../../styles/stack-duel.css'
import { motion } from 'framer-motion'
import { useCallback } from 'react'
import {
  FiArrowLeft,
  FiArrowDown,
  FiArrowRight,
  FiChevronLeft,
  FiClock,
  FiMenu,
  FiVolume2,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { StackDuelCinematic } from './components/StackDuelCinematic'
import { StackDuelTower } from './components/StackDuelTower'
import { useStackDuel } from './useStackDuel'
import { useOpponentLikeProps } from './useGameOpponent'
import { laneSpeedTier, LIFE_RECOVERY_PERFECTS, LIVES } from './utils/stackDuelEngine'
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
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const game = useStackDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const interact = useCallback(() => unlockStackDuelAudio(), [])

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
          <GameDuelBackdrop />
          <StackDuelCinematic />

          <button type="button" className="pm-stack-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
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
              <GamePlayerPortrait src={opponent.portrait} variant="pink" active={game.running} {...likeProps}/>
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
              <span>
                KOMBO GÜCÜ
                {game.running && laneSpeedTier(game.lane1) > 0 ? (
                  <em className="pm-stack-footer__speed"> · HIZ {laneSpeedTier(game.lane1) + 1}</em>
                ) : null}
              </span>
              <div className="pm-stack-footer__combo-bar">
                <span
                  className={game.lane1.combo >= 4 ? 'is-mega' : game.lane1.combo >= 2 ? 'is-hot' : ''}
                  style={{ width: `${Math.min(100, 12 + game.lane1.combo * 14)}%` }}
                />
              </div>
              {game.running && game.lane1.perfectStreak > 0 && game.lane1.lives < LIVES ? (
                <span className="pm-stack-footer__life-streak">
                  CAN SERİSİ {game.lane1.perfectStreak}/{LIFE_RECOVERY_PERFECTS}
                </span>
              ) : null}
            </div>
            <button type="button" className="pm-stack-footer__btn" aria-label="Menü">
              <FiMenu />
              <span>MENÜ</span>
            </button>
          </footer>

          {overlayMessage ? (
            <motion.div className="pm-stack-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status">
              <p>{overlayMessage}</p>
              {game.roundScoreSummary && game.isRoundBreak ? (
                <div className="pm-stack-overlay__scores" aria-label="Tur skorları">
                  <span className={`is-cyan${game.roundScoreSummary.winner === 'p1' ? ' is-winner' : ''}`}>
                    EMİR {formatScore(game.roundScoreSummary.p1)}
                  </span>
                  <span className="pm-stack-overlay__scores-sep">—</span>
                  <span className={`is-pink${game.roundScoreSummary.winner === 'p2' ? ' is-winner' : ''}`}>
                    ZEYNEP {formatScore(game.roundScoreSummary.p2)}
                  </span>
                </div>
              ) : null}
              {!game.running ? (
                <GameDuelRematchActions
                  onRestart={() => {
                    interact()
                    game.restartMatch()
                  }}
                  onExit={handleBack}
                  opponentName={opponent.name}
                />
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
