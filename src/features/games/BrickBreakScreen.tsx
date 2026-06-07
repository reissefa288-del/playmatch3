import { motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { BrickBreakCanvas } from './components/BrickBreakCanvas'
import { BrickPickupBanner } from './components/BrickPickupBanner'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { useBrickBreakDuel } from './useBrickBreakDuel'
import { useOpponentLikeProps } from './useGameOpponent'
import { unlockBrickBreakAudio } from './utils/brickBreakSounds'

function LivesRow({ lives, max, variant }: { lives: number; max: number; variant: 'cyan' | 'pink' }) {
  return (
    <div className={`pm-brick-lives is-${variant}`} aria-label={`${lives} can`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} className={index < lives ? 'is-full' : 'is-empty'} aria-hidden />
      ))}
    </div>
  )
}

export function BrickBreakScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const game = useBrickBreakDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const pressLeft = useCallback(() => {
    unlockBrickBreakAudio()
    game.setPlayerDirection(-1)
  }, [game])
  const pressRight = useCallback(() => {
    unlockBrickBreakAudio()
    game.setPlayerDirection(1)
  }, [game])
  const release = useCallback(() => game.setPlayerDirection(0), [game])
  const score1 = String(game.lane1.score).padStart(4, '0')
  const score2 = String(game.lane2.score).padStart(4, '0')

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'BERABERE'
      : game.lane1.lives <= 0 && game.winner === 'p2'
        ? 'CANLAR BİTTİ — OYUNCU 2 KAZANDI'
        : game.lane2.lives <= 0 && game.winner === 'p1'
          ? 'RAKİP CANLARI BİTTİ — OYUNCU 1 KAZANDI'
          : game.winner === 'p1'
            ? 'OYUNCU 1 KAZANDI'
            : 'OYUNCU 2 KAZANDI'
    : null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') game.setPlayerDirection(-1)
      if (event.key === 'ArrowRight') game.setPlayerDirection(1)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') game.setPlayerDirection(0)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [game])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--brick">
      <div className="pm-artboard">
        <motion.div
          className="pm-brick-screen"
          style={{ height: '100%', minHeight: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32 }}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-brick-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>

          <div className="pm-brick-screen__stack">
          <header className="pm-brick-header">
            <h1 className="pm-brick-header__title">
              <span className="is-cyan">BRICK BREAK</span>
              <span className="is-pink">DUEL</span>
            </h1>
          </header>

          <section className="pm-brick-hud" aria-label="Skor tablosu">
            <article className={`pm-brick-hud__side is-p1 ${game.running && game.lane1.lives > 0 ? 'is-active' : ''}`}>
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running && game.lane1.lives > 0} />
              <p className="pm-brick-hud__label">OYUNCU 1</p>
              <LivesRow lives={game.lane1.lives} max={game.maxLives} variant="cyan" />
              <div className="pm-brick-score-pill is-cyan">
                <span className="pm-brick-score-pill__tag">SKOR</span>
                <strong>{score1}</strong>
              </div>
            </article>

            <div className="pm-brick-center">
              <div className="pm-brick-center__block">
                <span className="pm-brick-center__label">SÜRE</span>
                <strong>{game.formatTime}</strong>
              </div>
              <div className="pm-brick-center__block">
                <span className="pm-brick-center__label">DALGA</span>
                <strong>{game.round}</strong>
              </div>
              {game.speedLevel > 0 ? (
                <div className="pm-brick-center__speed" aria-label={`Hız artışı yüzde ${game.speedLevel}`}>
                  +{game.speedLevel}%
                </div>
              ) : null}
            </div>

            <article className="pm-brick-hud__side is-p2">
              <GamePlayerPortrait src={opponent.portrait} variant="pink" {...likeProps}/>
              <p className="pm-brick-hud__label">OYUNCU 2</p>
              <LivesRow lives={game.lane2.lives} max={game.maxLives} variant="pink" />
              <div className="pm-brick-score-pill is-pink">
                <span className="pm-brick-score-pill__tag">SKOR</span>
                <strong>{score2}</strong>
              </div>
            </article>
          </section>

          <div className="pm-brick-duel">
            <div className="pm-brick-arena is-p1">
              <div className="pm-brick-arena__city" aria-hidden />
              <div className="pm-brick-arena__shine" aria-hidden />
              <BrickBreakCanvas laneRef={game.lane1RenderRef} accent="cyan" active={game.running} />
              <BrickPickupBanner banner={game.lane1.pickupBanner} variant="cyan" />
            </div>
            <div className="pm-brick-arena is-p2">
              <div className="pm-brick-arena__city" aria-hidden />
              <div className="pm-brick-arena__shine" aria-hidden />
              <BrickBreakCanvas laneRef={game.lane2RenderRef} accent="pink" active={game.running} />
              <BrickPickupBanner banner={game.lane2.pickupBanner} variant="pink" />
            </div>
          </div>

          <footer className="pm-brick-controls">
            <button
              type="button"
              className="pm-brick-controls__btn"
              aria-label="Sola git"
              onPointerDown={pressLeft}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="pm-brick-controls__btn"
              aria-label="Sağa git"
              onPointerDown={pressRight}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
            >
              <FiChevronRight />
            </button>
          </footer>
          </div>

          {!game.running && overlayMessage ? (
            <div className="pm-brick-overlay">
              <p>{overlayMessage}</p>
              <GameDuelRematchActions
                onRestart={game.restart}
                onExit={handleBack}
                opponentName={opponent.name}
                primaryClassName="pm-brick-overlay__btn"
              />
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
