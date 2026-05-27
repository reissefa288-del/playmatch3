import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_FEMALE, FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import bubbleHeaderVideo from '../../reference/video.mp4'
import vsBadge from '../../reference/vs.png'
import { SeamlessLoopVideo } from './components/SeamlessLoopVideo'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { BubbleBackIcon } from './components/BubbleGameIcons'
import { BubbleControlDock } from './components/BubbleControlDock'
import { BubbleShooterCanvas } from './components/BubbleShooterCanvas'
import { useBubbleShooterDuel } from './useBubbleShooterDuel'
import {
  AIM_MAX,
  AIM_MIN,
  COLOR_HEX,
  SPECIAL_KIND_META,
  SHOOTER_X,
  SHOOTER_Y,
  type BubbleColor,
  type BubbleKind,
} from './utils/bubbleShooterEngine'
import { unlockBubbleAudio } from './utils/bubbleShooterSounds'

function DuelScore({ value, variant }: { value: number; variant: 'p1' | 'p2' }) {
  return <em className={`is-${variant}`}>{value}</em>
}

function NextBubble({
  color,
  kind,
  label,
}: {
  color: BubbleColor
  kind: BubbleKind
  label: string
}) {
  const hex = COLOR_HEX[color]
  const special = kind !== 'normal' ? SPECIAL_KIND_META[kind] : null
  return (
    <div
      className={`pm-bubble-next${special ? ` is-${kind}` : ''}`}
      aria-label={special ? `${label} ${special.label}` : label}
    >
      <span className="pm-bubble-next__label">{label}</span>
      <span
        className="pm-bubble-next__orb"
        style={{
          ['--orb-core' as string]: hex,
          ['--orb-light' as string]: hex,
          ['--orb-dark' as string]: `${hex}99`,
          ...(special
            ? {
                ['--orb-special' as string]: special.hex,
                ['--orb-special-glow' as string]: special.glow,
              }
            : {}),
        }}
      />
      {special ? <span className="pm-bubble-next__tag">{special.label}</span> : null}
    </div>
  )
}

export function BubbleShooterScreen() {
  const navigate = useNavigate()
  const game = useBubbleShooterDuel()
  const aimDragRef = useRef(false)

  const handleBack = useCallback(() => navigate(-1), [navigate])
  const interact = useCallback(() => unlockBubbleAudio(), [])
  const pressLeft = useCallback(() => {
    interact()
    game.setAimDirection(-1)
  }, [game, interact])
  const pressRight = useCallback(() => {
    interact()
    game.setAimDirection(1)
  }, [game, interact])
  const release = useCallback(() => game.setAimDirection(0), [game])
  const handleFire = useCallback(() => {
    interact()
    game.fire()
  }, [game, interact])
  const handleSwap = useCallback(() => {
    interact()
    game.swapBubble()
  }, [game, interact])

  const aimFromPointer = useCallback(
    (e: PointerEvent) => {
      if (!aimDragRef.current) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width)
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height)
      const angle = Math.atan2(ny - SHOOTER_Y, nx - SHOOTER_X)
      const clamped = Math.max(AIM_MIN, Math.min(AIM_MAX, angle))
      game.setAimAngle(clamped)
    },
    [game],
  )

  const playing = game.running

  const overlayMessage = !game.running
    ? game.winner === 'draw'
      ? 'MAÇ BERABERE'
      : game.winner === 'p1'
        ? 'EMİR KAZANDI'
        : 'ZEYNEP KAZANDI'
    : null

  useEffect(() => {
    const unlockOnGesture = () => interact()
    window.addEventListener('pointerdown', unlockOnGesture, { capture: true, once: false })
    window.addEventListener('keydown', unlockOnGesture, { capture: true, once: false })

    const onKeyDown = (event: KeyboardEvent) => {
      if (!playing) return
      interact()
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
      window.removeEventListener('pointerdown', unlockOnGesture, { capture: true })
      window.removeEventListener('keydown', unlockOnGesture, { capture: true })
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [game, handleFire, interact, playing])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--bubble">
      <div className="pm-artboard">
        <div className="pm-bubble-screen" onPointerDown={interact}>
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
            <span className="pm-bubble-screen-video__grade" aria-hidden />
          </div>
          <div className="pm-bubble-screen__stack">
          <div className="pm-bubble-hud-band">
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
            <div className="pm-bubble-stats__block">
              <span className="pm-bubble-stats__label">
                ROUND {game.roundNumber}/{game.winPoints}
              </span>
              <strong className="pm-bubble-stats__value">{game.formatTime}</strong>
            </div>
            <div className="pm-bubble-stats__block is-score">
              <span className="pm-bubble-stats__label">SKOR</span>
              <strong className="pm-bubble-stats__value is-duel-score">
                <DuelScore value={game.lane1.score} variant="p1" />
                <i aria-hidden>/</i>
                <DuelScore value={game.lane2.score} variant="p2" />
              </strong>
            </div>
            <div className="pm-bubble-stats__block is-next">
              <span className="pm-bubble-stats__label">SIRADAKİ</span>
              <div className="pm-bubble-stats__next-row">
                <NextBubble color={game.lane1.nextColor} kind={game.lane1.nextKind} label="Sol" />
                <NextBubble color={game.lane2.nextColor} kind={game.lane2.nextKind} label="Sağ" />
              </div>
            </div>
          </section>
          </div>

          <div className="pm-bubble-duel">
            <div className={`pm-bubble-arena is-p1 ${playing ? 'is-live' : ''}`}>
              <span className="pm-bubble-arena__aura" aria-hidden />
              <div className="pm-bubble-arena__city" aria-hidden />
              <div
                className="pm-bubble-aim-pad"
                onPointerDown={(e) => {
                  if (!playing) return
                  aimDragRef.current = true
                  game.setAimDirection(0)
                  e.currentTarget.setPointerCapture(e.pointerId)
                  aimFromPointer(e)
                }}
                onPointerMove={aimFromPointer}
                onPointerUp={(e) => {
                  aimDragRef.current = false
                  try {
                    e.currentTarget.releasePointerCapture(e.pointerId)
                  } catch {
                    // ignore
                  }
                }}
                onPointerCancel={() => {
                  aimDragRef.current = false
                }}
                aria-hidden
              />
              <BubbleShooterCanvas
                laneRef={game.lane1RenderRef}
                accent="cyan"
                showShooterExtras
                active={playing}
                showAimGuide={playing}
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
          </div>

          <footer className="pm-bubble-footer">
            <div className="pm-bubble-footer__scores" aria-label="Tur skoru">
              <span className="pm-bubble-footer__points is-p1">{game.lane1.matchPoints}</span>
              <img
                className="pm-bubble-footer__vs-img"
                src={vsBadge}
                alt=""
                draggable={false}
                aria-hidden
              />
              <span className="pm-bubble-footer__points is-p2">{game.lane2.matchPoints}</span>
            </div>
            <div className="pm-bubble-footer__controls">
              <button type="button" className="pm-bubble-back" onClick={handleBack} aria-label="Geri dön">
                <span className="pm-bubble-back__bezel" aria-hidden />
                <span className="pm-bubble-back__face">
                  <BubbleBackIcon />
                </span>
              </button>
              <div className="pm-bubble-footer__dock-center">
                <BubbleControlDock
                  live={playing}
                  onAimLeft={pressLeft}
                  onAimRight={pressRight}
                  onAimRelease={release}
                  onSwap={handleSwap}
                  onFire={handleFire}
                />
              </div>
              <span className="pm-bubble-footer__controls-spacer" aria-hidden />
            </div>
          </footer>
          </div>

          {!game.running && overlayMessage ? (
            <motion.div className="pm-bubble-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>{overlayMessage}</p>
              <p className="pm-bubble-overlay__sub">
                {game.lane1.matchPoints} — {game.lane2.matchPoints}
              </p>
              <button
                type="button"
                className="pm-bubble-overlay__btn"
                onClick={() => {
                  interact()
                  game.restart()
                }}
              >
                TEKRAR OYNA
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
