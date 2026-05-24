import { motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { BubbleAmbientBg } from './components/BubbleAmbientBg'
import {
  BubbleAimLeftIcon,
  BubbleAimRightIcon,
  BubbleBackIcon,
  BubbleFireIcon,
  BubbleSwapIcon,
  BubbleTrophyIcon,
} from './components/BubbleGameIcons'
import { BubbleShooterCanvas } from './components/BubbleShooterCanvas'
import { useBubbleShooterDuel } from './useBubbleShooterDuel'
import { COLOR_HEX, type BubbleColor } from './utils/bubbleShooterEngine'
import { unlockBubbleAudio } from './utils/bubbleShooterSounds'

const PROFILE_SCORES = { p1: 1250, p2: 1180 }

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
          <BubbleAmbientBg />

          <button type="button" className="pm-bubble-back" onClick={handleBack} aria-label="Geri dön">
            <BubbleBackIcon />
          </button>

          <div className="pm-bubble-screen__stack">
          <header className="pm-bubble-header">
            <h1 className="pm-bubble-header__title">
              <span className="is-cyan">BUBBLE</span>
              <span className="is-pink">SHOOTER</span>
              <span className="is-gold">DUEL</span>
            </h1>
          </header>

          <section className="pm-bubble-hud" aria-label="Oyuncu bilgileri">
            <article className="pm-bubble-hud__side is-p1">
              <div className="pm-bubble-hud-frame is-cyan">
                <img src={FAKE_PORTRAIT_MALE} alt="" className="pm-bubble-hud-frame__photo" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--tl" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--tr" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--bl" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--br" />
              </div>
              <p className="pm-bubble-hud__name">EMİR</p>
              <p className="pm-bubble-hud__trophy">
                <BubbleTrophyIcon size={13} />
                <span>{PROFILE_SCORES.p1}</span>
              </p>
              <p className="pm-bubble-hud__round-wins">
                {game.lane1.matchPoints}/{game.winPoints}
              </p>
            </article>

            <article className="pm-bubble-hud__side is-p2">
              <div className="pm-bubble-hud-frame is-pink">
                <img src={FAKE_PORTRAIT_FEMALE} alt="" className="pm-bubble-hud-frame__photo" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--tl" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--tr" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--bl" />
                <span className="pm-bubble-hud-frame__bracket pm-bubble-hud-frame__bracket--br" />
              </div>
              <p className="pm-bubble-hud__name">ZEYNEP</p>
              <p className="pm-bubble-hud__trophy">
                <BubbleTrophyIcon size={13} />
                <span>{PROFILE_SCORES.p2}</span>
              </p>
              <p className="pm-bubble-hud__round-wins">
                {game.lane2.matchPoints}/{game.winPoints}
              </p>
            </article>
          </section>

          <section className="pm-bubble-stats" aria-label="Maç durumu">
            <motion.div className="pm-bubble-stats__block">
              <span>ROUND {game.roundNumber}/{game.winPoints}</span>
              <strong>{game.formatTime}</strong>
            </motion.div>
            <motion.div className="pm-bubble-stats__block is-score">
              <span>SKOR</span>
              <strong>
                <em className="is-p1">{game.lane1.score}</em>
                <i aria-hidden>/</i>
                <em className="is-p2">{game.lane2.score}</em>
              </strong>
            </motion.div>
            <motion.div className="pm-bubble-stats__block is-next">
              <span>SIRADAKİ</span>
              <motion.div className="pm-bubble-stats__next-row">
                <NextBubble color={game.lane1.nextColor} label="Sol" />
                <NextBubble color={game.lane2.nextColor} label="Sağ" />
              </motion.div>
            </motion.div>
          </section>

          <motion.div
            className="pm-bubble-duel"
            key={game.shakeKey}
            animate={{ x: [0, -4, 4, -3, 3, 0] }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="pm-bubble-arena is-p1">
              <div className="pm-bubble-arena__city" aria-hidden />
              <BubbleShooterCanvas
                laneRef={game.lane1RenderRef}
                accent="cyan"
                showShooterExtras
                active={playing}
              />
            </div>
            <div className="pm-bubble-arena is-p2">
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
            <p className="pm-bubble-footer__hint">
              3 ROUND · SÜRE BİTİNCE YÜKSEK SKOR KAZANIR · BOŞ ATIŞLARDA YENİ SIRA GELİR
            </p>
            <motion.div className="pm-bubble-footer__vs">
              <span className="pm-bubble-footer__points is-p1">{game.lane1.matchPoints}</span>
              <strong className="pm-bubble-footer__vs-badge">VS</strong>
              <span className="pm-bubble-footer__points is-p2">{game.lane2.matchPoints}</span>
            </motion.div>
            <div className="pm-bubble-controls">
              <button
                type="button"
                className="pm-bubble-controls__btn"
                aria-label="Sola nişan"
                disabled={!playing}
                onPointerDown={pressLeft}
                onPointerUp={release}
                onPointerLeave={release}
              >
                <BubbleAimLeftIcon />
              </button>
              <button
                type="button"
                className="pm-bubble-controls__btn pm-bubble-controls__btn--swap"
                aria-label="Balon değiştir"
                disabled={!playing}
                onClick={handleSwap}
              >
                <BubbleSwapIcon />
              </button>
              <button
                type="button"
                className="pm-bubble-controls__btn pm-bubble-controls__btn--fire"
                aria-label="Ateş"
                disabled={!playing}
                onClick={handleFire}
              >
                <BubbleFireIcon />
              </button>
              <button
                type="button"
                className="pm-bubble-controls__btn"
                aria-label="Sağa nişan"
                disabled={!playing}
                onPointerDown={pressRight}
                onPointerUp={release}
                onPointerLeave={release}
              >
                <BubbleAimRightIcon />
              </button>
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
