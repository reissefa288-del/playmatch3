import { motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import bubbleHeaderVideo from '../../reference/video.mp4'
import { SeamlessLoopVideo } from './components/SeamlessLoopVideo'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import {
  BubbleAimLeftIcon,
  BubbleAimRightIcon,
  BubbleBackIcon,
  BubbleFireIcon,
  BubbleSwapIcon,
} from './components/BubbleGameIcons'
import { BubbleShooterCanvas } from './components/BubbleShooterCanvas'
import { useBubbleShooterDuel } from './useBubbleShooterDuel'
import { COLOR_HEX, type BubbleColor } from './utils/bubbleShooterEngine'
import { unlockBubbleAudio } from './utils/bubbleShooterSounds'

function DuelScore({ value, variant }: { value: number; variant: 'p1' | 'p2' }) {
  return (
    <motion.em
      key={value}
      className={`is-${variant}`}
      initial={{ scale: 1.12, opacity: 0.55 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {value}
    </motion.em>
  )
}

function NextBubble({ color, label }: { color: BubbleColor; label: string }) {
  const hex = COLOR_HEX[color]
  return (
    <motion.div className="pm-bubble-next" aria-label={label}>
      <span className="pm-bubble-next__label">{label}</span>
      <span
        className="pm-bubble-next__orb"
        style={{
          ['--orb-core' as string]: hex,
          ['--orb-light' as string]: hex,
          ['--orb-dark' as string]: `${hex}99`,
        }}
      />
    </motion.div>
  )
}

export function BubbleShooterScreen() {
  const navigate = useNavigate()
  const game = useBubbleShooterDuel()

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const pressLeft = useCallback(() => {
    unlockBubbleAudio()
    game.setAimDirection(-1)
  }, [game])
  const pressRight = useCallback(() => {
    unlockBubbleAudio()
    game.setAimDirection(1)
  }, [game])
  const release = useCallback(() => game.setAimDirection(0), [game])
  const handleFire = useCallback(() => {
    unlockBubbleAudio()
    game.fire()
  }, [game])
  const handleSwap = useCallback(() => {
    unlockBubbleAudio()
    game.swapBubble()
  }, [game])

  const playing = game.running
  const isPlayerTurn = playing && game.activeTurn === 'p1'

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!playing) return
      if (event.key === 'ArrowLeft') game.setAimDirection(-1)
      if (event.key === 'ArrowRight') game.setAimDirection(1)
      if (event.key === ' ') {
        event.preventDefault()
        handleFire()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') game.setAimDirection(0)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [game, handleFire, playing])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--bubble">
      <div className="pm-artboard">
        <motion.div
          className="pm-bubble-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32 }}
        >
          <div className="pm-bubble-screen-video" aria-hidden>
            <div className="pm-bubble-screen-video__crop is-p1">
              <SeamlessLoopVideo
                className="pm-bubble-screen-video__media"
                src={bubbleHeaderVideo}
                crossfadeSec={0.52}
              />
            </div>
            <div className="pm-bubble-screen-video__crop is-p2">
              <SeamlessLoopVideo
                className="pm-bubble-screen-video__media"
                src={bubbleHeaderVideo}
                crossfadeSec={0.52}
              />
            </div>
            <span className="pm-bubble-screen-video__panel is-p1" aria-hidden />
            <span className="pm-bubble-screen-video__panel is-p2" aria-hidden />
            <span className="pm-bubble-screen-video__orb is-cyan" />
            <span className="pm-bubble-screen-video__orb is-pink" />
            <span className="pm-bubble-screen-video__grid" />
            <span className="pm-bubble-screen-video__scan" />
          </div>
          <div className="pm-bubble-screen__stack">
          <div className="pm-bubble-hud-band">
            <div className="pm-bubble-hero-bg" aria-hidden>
              <span className="pm-bubble-hero-bg__panel is-p1" aria-hidden />
              <span className="pm-bubble-hero-bg__panel is-p2" aria-hidden />
              <span className="pm-bubble-hero-bg__orb is-cyan" />
              <span className="pm-bubble-hero-bg__orb is-pink" />
              <span className="pm-bubble-hero-bg__grid" />
              <span className="pm-bubble-hero-bg__scan" />
            </div>

          <header className="pm-bubble-header" aria-label="Oyuncu bilgileri">
            <article className="pm-bubble-header__side is-p1">
              <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={playing} />
              <p className="pm-bubble-header__round-wins">
                {game.lane1.matchPoints}/{game.winPoints}
              </p>
              <p className="pm-bubble-header__name">EMİR</p>
            </article>

            <h1 className="pm-bubble-header__title">
              <span className="is-cyan">BUBBLE</span>
              <span className="is-pink">SHOOTER</span>
              <span className="is-gold">DUEL</span>
            </h1>

            <article className="pm-bubble-header__side is-p2">
              <GamePlayerPortrait src={FAKE_PORTRAIT_FEMALE} variant="pink" active={playing} />
              <p className="pm-bubble-header__round-wins">
                {game.lane2.matchPoints}/{game.winPoints}
              </p>
              <p className="pm-bubble-header__name">ZEYNEP</p>
            </article>
          </header>

          <section className="pm-bubble-stats" aria-label="Maç durumu">
            <motion.div className="pm-bubble-stats__block">
              <span className="pm-bubble-stats__label">
                ROUND {game.roundNumber}/{game.winPoints}
              </span>
              <strong className="pm-bubble-stats__value">{game.formatTime}</strong>
            </motion.div>
            <motion.div className="pm-bubble-stats__block is-score" key={`score-${game.roundNumber}`}>
              <span className="pm-bubble-stats__label">SKOR</span>
              <strong className="pm-bubble-stats__value is-duel-score">
                <DuelScore value={game.lane1.score} variant="p1" />
                <i aria-hidden>/</i>
                <DuelScore value={game.lane2.score} variant="p2" />
              </strong>
            </motion.div>
            <motion.div className="pm-bubble-stats__block is-next">
              <span className="pm-bubble-stats__label">SIRADAKİ</span>
              <motion.div className="pm-bubble-stats__next-row">
                <NextBubble color={game.lane1.nextColor} label="Sol" />
                <NextBubble color={game.lane2.nextColor} label="Sağ" />
              </motion.div>
            </motion.div>
          </section>
          </div>

          <motion.div
            className="pm-bubble-duel"
            key={game.shakeKey}
            animate={{ x: [0, -4, 4, -3, 3, 0] }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className={`pm-bubble-arena is-p1 ${playing ? 'is-live' : ''}`}>
              <span className="pm-bubble-arena__aura" aria-hidden />
              <div className="pm-bubble-arena__city" aria-hidden />
              <BubbleShooterCanvas
                laneRef={game.lane1RenderRef}
                accent="cyan"
                showShooterExtras
                active={playing}
                showAimGuide={isPlayerTurn}
              />
            </div>
            <div className={`pm-bubble-arena is-p2 ${playing ? 'is-live' : ''}`}>
              <span className="pm-bubble-arena__aura" aria-hidden />
              <div className="pm-bubble-arena__city" aria-hidden />
              <BubbleShooterCanvas
                laneRef={game.lane2RenderRef}
                accent="pink"
                showShooterExtras
                active={playing}
              />
            </div>
          </motion.div>

          <footer className="pm-bubble-footer">
            <motion.div className="pm-bubble-footer__vs">
              <span className="pm-bubble-footer__points is-p1">{game.lane1.matchPoints}</span>
              <strong className="pm-bubble-footer__vs-badge">VS</strong>
              <span className="pm-bubble-footer__points is-p2">{game.lane2.matchPoints}</span>
            </motion.div>
            <div className="pm-bubble-footer__actions">
              <button type="button" className="pm-bubble-back" onClick={handleBack} aria-label="Geri dön">
                <BubbleBackIcon />
              </button>
              <div className={`pm-bubble-controls-dock ${playing ? 'is-live' : ''}`}>
                <div className="pm-bubble-controls-dock__aura" aria-hidden />
                <div className={`pm-bubble-controls ${playing ? 'is-live' : ''}`}>
                  <button
                    type="button"
                    className="pm-bubble-controls__btn is-aim"
                    aria-label="Sola nişan"
                    disabled={!isPlayerTurn}
                    onPointerDown={pressLeft}
                    onPointerUp={release}
                    onPointerLeave={release}
                  >
                    <span className="pm-bubble-controls__btn-inner">
                      <BubbleAimLeftIcon />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="pm-bubble-controls__btn pm-bubble-controls__btn--swap"
                    aria-label="Balon değiştir"
                    disabled={!isPlayerTurn}
                    onClick={handleSwap}
                  >
                    <span className="pm-bubble-controls__btn-inner">
                      <BubbleSwapIcon />
                    </span>
                  </button>
                  <motion.button
                    type="button"
                    className="pm-bubble-controls__btn pm-bubble-controls__btn--fire"
                    aria-label="Ateş"
                    disabled={!isPlayerTurn}
                    onClick={handleFire}
                    whileTap={playing ? { scale: 0.9 } : undefined}
                  >
                    <span className="pm-bubble-controls__btn-ring" aria-hidden />
                    <span className="pm-bubble-controls__btn-ring is-delay" aria-hidden />
                    <span className="pm-bubble-controls__btn-inner">
                      <BubbleFireIcon size={26} />
                    </span>
                  </motion.button>
                  <button
                    type="button"
                    className="pm-bubble-controls__btn is-aim"
                    aria-label="Sağa nişan"
                    disabled={!isPlayerTurn}
                    onPointerDown={pressRight}
                    onPointerUp={release}
                    onPointerLeave={release}
                  >
                    <span className="pm-bubble-controls__btn-inner">
                      <BubbleAimRightIcon />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </footer>
          </div>

          {!game.running && overlayMessage ? (
            <motion.div className="pm-bubble-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>{overlayMessage}</p>
              <p className="pm-bubble-overlay__sub">
                {game.lane1.matchPoints} — {game.lane2.matchPoints}
              </p>
              <button type="button" className="pm-bubble-overlay__btn" onClick={game.restart}>
                TEKRAR OYNA
              </button>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
