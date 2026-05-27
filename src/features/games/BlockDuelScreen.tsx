import { motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { BlockBoardCanvas } from './components/BlockBoardCanvas'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import {
  BlockArrowDownIcon,
  BlockArrowLeftIcon,
  BlockArrowRightIcon,
  BlockBackIcon,
  BlockLightningIcon,
  BlockRotateIcon,
  BlockTrophyIcon,
} from './components/BlockGameIcons'
import { useBlockDuel } from './useBlockDuel'
import { unlockBlockAudio } from './utils/blockSounds'

const PROFILE_SCORES = { p1: 1250, p2: 980 }

export function BlockDuelScreen() {
  const navigate = useNavigate()
  const game = useBlockDuel()

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
        <motion.div
          className="pm-block-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32 }}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-block-back" onClick={handleBack} aria-label="Geri dön">
            <BlockBackIcon />
          </button>

          <div className="pm-block-screen__stack">
            <header className="pm-block-header">
              <h1 className="pm-block-header__title">
                <span className="is-cyan">BLOCK</span>
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
                <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" />
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

            <motion.section
              className="pm-block-duel"
              aria-label="Oyun alanları"
              key={game.shakeKey}
              animate={{ x: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              {game.comboBanner ? (
                <motion.div
                  className="pm-block-combo-banner"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {game.comboBanner}
                </motion.div>
              ) : null}
              <motion.div
                className={`pm-block-arena is-p1 ${!game.lane1.alive ? 'is-dead' : ''}`}
                animate={
                  game.roundIntro > 0
                    ? { scale: [1, 1.015, 1], opacity: [0.9, 1, 0.9] }
                    : { scale: 1, opacity: 1 }
                }
                transition={game.roundIntro > 0 ? { duration: 0.7, repeat: Infinity } : { duration: 0.2 }}
              >
                <BlockBoardCanvas laneRef={game.lane1ViewRef} accent="cyan" />
              </motion.div>
              <div className={`pm-block-arena is-p2 ${!game.lane2.alive ? 'is-dead' : ''}`}>
                <BlockBoardCanvas laneRef={game.lane2ViewRef} accent="pink" />
              </div>
            </motion.section>

            <section className="pm-block-attack" aria-label="Saldırı göstergesi">
              <span className="pm-block-attack__label">ATTACK METER</span>
              <div className="pm-block-attack__track">
                <span className="pm-block-attack__fill is-p1" style={{ width: `${game.attackMeter}%` }} />
                <span
                  className="pm-block-attack__fill is-p2"
                  style={{ width: `${100 - game.attackMeter}%` }}
                />
                <span className="pm-block-attack__bolt">
                  <BlockLightningIcon size={18} />
                </span>
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
                  <span>LINES</span>
                  <strong>{game.lane1.lines}</strong>
                </div>
                <div>
                  <span>COMBO</span>
                  <strong>{game.lane1.combo}</strong>
                </div>
              </div>
              <div className="pm-block-stats__panel is-p2">
                <div>
                  <span>LINES</span>
                  <strong>{game.lane2.lines}</strong>
                </div>
                <div>
                  <span>COMBO</span>
                  <strong>{game.lane2.combo}</strong>
                </div>
              </div>
            </footer>

            <p className="pm-block-footer__hint">
              ENTER HARD DROP · İLK {game.winRounds} TUR
            </p>
          </div>

          {game.roundIntro > 0 && !overlayMessage ? (
            <motion.div
              className="pm-block-round-intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span>ROUND {game.roundNumber}</span>
              <strong>BAŞLA!</strong>
            </motion.div>
          ) : null}

          {overlayMessage ? (
            <motion.div className="pm-block-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>{overlayMessage}</p>
              <p className="pm-block-overlay__sub">
                {game.matchPoints.p1} — {game.matchPoints.p2}
              </p>
              <button type="button" className="pm-block-overlay__btn" onClick={game.restart}>
                TEKRAR OYNA
              </button>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
