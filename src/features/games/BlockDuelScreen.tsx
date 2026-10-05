import '../../styles/block-duel.css'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { BlockBoardCanvas } from './components/BlockBoardCanvas'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import {
  BlockArrowDownIcon,
  BlockArrowLeftIcon,
  BlockArrowRightIcon,
  BlockBackIcon,
  BlockRotateIcon,
  BlockTrophyIcon,
} from './components/BlockGameIcons'
import { useBlockDuel } from './useBlockDuel'
import { useOpponentLikeProps } from './useGameOpponent'
import { unlockBlockAudio } from './utils/blockSounds'

const PROFILE_SCORES = { p1: 1250, p2: 980 }

export function BlockDuelScreen() {
  const navigate = useNavigate()
  const game = useBlockDuel()
  const { opponent, likeProps } = useOpponentLikeProps()

  const handleBack = useCallback(() => navigate(-1), [navigate])

  const pressLeft = useCallback(() => {
    unlockBlockAudio()
    game.pressLeft()
  }, [game])

  const pressRight = useCallback(() => {
    unlockBlockAudio()
    game.pressRight()
  }, [game])

  const pressDown = useCallback(() => {
    unlockBlockAudio()
    game.setHoldDown(true)
    game.pressDown()
  }, [game])

  const releaseDown = useCallback(() => game.setHoldDown(false), [game])

  const pressRotate = useCallback(() => {
    unlockBlockAudio()
    game.pressRotate()
  }, [game])

  const overlayMessage = game.winner
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'PLAYER 1 KAZANDI'
        : 'PLAYER 2 KAZANDI'
    : null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!game.running) return
      unlockBlockAudio()
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        game.setHoldLeft(true)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        game.setHoldRight(true)
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        game.setHoldDown(true)
        game.pressDown()
      }
      if (event.key === 'ArrowUp' || event.key === ' ') {
        event.preventDefault()
        game.pressRotate()
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        game.hardDrop()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') game.setHoldLeft(false)
      if (event.key === 'ArrowRight') game.setHoldRight(false)
      if (event.key === 'ArrowDown') game.setHoldDown(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    game.running,
    game.setHoldLeft,
    game.setHoldRight,
    game.setHoldDown,
    game.pressDown,
    game.pressRotate,
    game.hardDrop,
  ])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--block">
      <div className="pm-artboard">
        <div
          className="pm-block-screen"
         
         
         
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-block-back" onClick={handleBack} aria-label="Geri dön">
            <BlockBackIcon />
          </button>

          <div className="pm-block-screen__stack">
            <header className="pm-block-header">
              <h1 className="pm-block-header__title">
                <span className="is-cyan">CUBE</span>
                <span className="is-pink">DUEL</span>
              </h1>
            </header>

            <section className="pm-block-top" aria-label="Oyuncular">
              <article className={`pm-block-player is-p1 ${game.running ? 'is-active' : ''}`}>
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={game.running} />
                <p className="pm-block-player__name">PLAYER 1</p>
                <p className="pm-block-player__trophy">
                  <BlockTrophyIcon size={11} />
                  <span>{PROFILE_SCORES.p1}</span>
                </p>
                <p className="pm-block-player__wins">
                  {game.matchPoints.p1}/{game.winRounds}
                </p>
              </article>

              <div className="pm-block-timer">
                <span className="pm-block-timer__label">
                  ROUND {game.roundNumber}/{game.matchRounds}
                </span>
                <strong className="pm-block-timer__value">{game.formatTime}</strong>
              </div>

              <article className="pm-block-player is-p2">
                <GamePlayerPortrait src={opponent.portrait} variant="pink" {...likeProps} />
                <p className="pm-block-player__name">PLAYER 2</p>
                <p className="pm-block-player__trophy">
                  <BlockTrophyIcon size={11} />
                  <span>{PROFILE_SCORES.p2}</span>
                </p>
                <p className="pm-block-player__wins">
                  {game.matchPoints.p2}/{game.winRounds}
                </p>
              </article>
            </section>

            <section
              className="pm-block-duel"
              aria-label="Oyun alanları"
              key={game.shakeKey}
             
             
            >
              <div
                className={`pm-block-arena is-p1 ${!game.lane1.alive ? 'is-dead' : ''}`}
               
               
              >
                <BlockBoardCanvas laneRef={game.lane1ViewRef} accent="cyan" />
              </div>
              <div className={`pm-block-arena is-p2 ${!game.lane2.alive ? 'is-dead' : ''}`}>
                <BlockBoardCanvas laneRef={game.lane2ViewRef} accent="pink" />
              </div>
            </section>

            <section className="pm-block-controls" aria-label="Kontroller">
              <button
                type="button"
                className="pm-block-controls__btn is-cyan"
                aria-label="Sol"
                disabled={!game.running}
                onPointerDown={pressLeft}
              >
                <BlockArrowLeftIcon />
                <span>SOL</span>
              </button>
              <button
                type="button"
                className="pm-block-controls__btn is-cyan"
                aria-label="Sağ"
                disabled={!game.running}
                onPointerDown={pressRight}
              >
                <BlockArrowRightIcon />
                <span>SAĞ</span>
              </button>
              <button
                type="button"
                className="pm-block-controls__btn is-pink"
                aria-label="Aşağı"
                disabled={!game.running}
                onPointerDown={pressDown}
                onPointerUp={releaseDown}
                onPointerLeave={releaseDown}
                onPointerCancel={releaseDown}
              >
                <BlockArrowDownIcon />
                <span>AŞAĞI</span>
              </button>
              <button
                type="button"
                className="pm-block-controls__btn is-gold"
                aria-label="Döndür"
                disabled={!game.running}
                onPointerDown={pressRotate}
              >
                <BlockRotateIcon />
                <span>DÖNDÜR</span>
              </button>
            </section>

            <footer className="pm-block-stats" aria-label="İstatistikler">
              <div className="pm-block-stats__panel is-p1">
                <div>
                  <span>FÜZYON</span>
                  <strong
                    key={game.lane1.fusions}
                   
                   
                   
                  >
                    {game.lane1.fusions}
                  </strong>
                </div>
                <div>
                  <span>ZİNCİR</span>
                  <strong>{game.lane1.combo > 1 ? `×${game.lane1.combo}` : '—'}</strong>
                </div>
              </div>
              <div className="pm-block-stats__panel is-p2">
                <div>
                  <span>FÜZYON</span>
                  <strong>{game.lane2.fusions}</strong>
                </div>
                <div>
                  <span>ZİNCİR</span>
                  <strong>{game.lane2.combo > 1 ? `×${game.lane2.combo}` : '—'}</strong>
                </div>
              </div>
            </footer>
          </div>

          {game.roundIntro > 0 && !overlayMessage ? (
            <div
              className="pm-block-round-intro"
             
             
            >
              <span>ROUND {game.roundNumber}</span>
              <strong>BAŞLA!</strong>
            </div>
          ) : null}

          {overlayMessage ? (
            <div className="pm-block-overlay">
              <p>{overlayMessage}</p>
              <p className="pm-block-overlay__sub">
                {game.matchPoints.p1} — {game.matchPoints.p2}
              </p>
              <GameDuelRematchActions
                onRestart={game.restart}
                onExit={handleBack}
                opponentName={opponent.name}
                primaryClassName="pm-block-overlay__btn"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
