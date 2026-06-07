import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { MissileCommandDuelArena } from './components/MissileCommandDuelArena'
import { RiftWardComboBadge } from './components/RiftWardComboBadge'
import { RiftWardMatchPips } from './components/RiftWardMatchPips'
import { RiftWardNexusBar } from './components/RiftWardNexusBar'
import { RiftWardScoreFloat } from './components/RiftWardScoreFloat'
import { RiftWardTimerRing } from './components/RiftWardTimerRing'
import { GameDuelBackdrop } from './components/GameDuelBackdrop'
import { GameDuelRematchActions } from './components/GameDuelRematchActions'
import { GamePlayerPortrait } from './components/GamePlayerPortrait'
import { playRiftWardSound, startRiftWardAmbient, stopRiftWardAmbient, unlockRiftWardAudio } from './utils/riftWardSounds'
import { useMissileCommandDuel } from './useMissileCommandDuel'
import { useOpponentLikeProps } from './useGameOpponent'

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

function overlayVariant(duel: ReturnType<typeof useMissileCommandDuel>) {
  if (!duel.running && duel.winner === 'p1') return 'is-match-win'
  if (!duel.running && duel.winner === 'p2') return 'is-match-lose'
  if (!duel.running && duel.winner === 'draw') return 'is-match-draw'
  if (duel.legMessage === 'LEG KAZANDIN') return 'is-leg-win'
  if (duel.legMessage === 'LEG KAYBETTİN') return 'is-leg-lose'
  if (duel.legMessage === 'LEG BERABERE') return 'is-leg-draw'
  return ''
}

export function MissileCommandDuelScreen() {
  const { opponent, likeProps } = useOpponentLikeProps()
  const navigate = useNavigate()
  const duel = useMissileCommandDuel()

  const handleBack = useCallback(() => navigate('/games'), [navigate])
  const audioStartedRef = useRef(false)

  const handleUnlockAudio = useCallback(() => {
    unlockRiftWardAudio()
    if (audioStartedRef.current) return
    audioStartedRef.current = true
    startRiftWardAmbient()
    playRiftWardSound('start')
  }, [])
  const canPlay = duel.running && !duel.legMessage

  const overlayMessage = !duel.running
    ? duel.winner === 'draw'
      ? 'MAÇ BERABERE'
      : duel.winner === 'p1'
        ? 'KAZANDIN!'
        : 'KAYBETTİN'
    : duel.legMessage

  const overlaySub = useMemo(() => {
    if (!duel.legMessage && duel.running) return null
    const p1 = formatScore(duel.game.p1.score)
    const p2 = formatScore(duel.game.p2.score)
    const legs = `LEG ${duel.game.p1.matchPoints} – ${duel.game.p2.matchPoints}`
    if (!duel.running) return `${p1} · ${p2} · ${legs}`
    return `${p1} · ${p2}`
  }, [duel.game.p1.matchPoints, duel.game.p1.score, duel.game.p2.matchPoints, duel.game.p2.score, duel.legMessage, duel.running])

  const overlayBadge = !duel.running
    ? 'MAÇ SONU'
    : duel.legMessage
      ? `LEG ${duel.game.roundNumber}/${duel.matchRounds}`
      : null

  useEffect(() => () => stopRiftWardAmbient(), [])

  const handleRestart = useCallback(() => {
    duel.restartMatch()
    if (audioStartedRef.current) playRiftWardSound('start')
  }, [duel])

  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--missile">
      <div className="pm-artboard">
        <motion.div
          className="pm-missile-screen-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={handleUnlockAudio}
        >
          <GameDuelBackdrop />

          <button type="button" className="pm-missile-back" onClick={handleBack} aria-label="Geri dön">
            <FiArrowLeft />
          </button>
          <div className="pm-missile-play__stack">
            <header className="pm-missile-header">
              <h1 className="pm-missile-header__title">
                <span className="is-flash">RIFT</span>
                <span className="is-base">WARD</span>
              </h1>
              <p className="pm-missile-header__sub">
                LEG {duel.game.roundNumber}/{duel.matchRounds} • DALGA {duel.game.p1.wave} • {formatScore(duel.pointsToWin)} PUAN
              </p>
              <RiftWardMatchPips p1Wins={duel.game.p1.matchPoints} p2Wins={duel.game.p2.matchPoints} />
            </header>

            <section className="pm-missile-hud">
              <div className="pm-missile-hud__side">
                <GamePlayerPortrait src={FAKE_PORTRAIT_MALE} variant="cyan" active={canPlay} />
                <p>EMİR</p>
                <strong
                  key={duel.scorePulseP1}
                  className={duel.scorePulseP1 > 0 ? 'is-pulse' : ''}
                >
                  {formatScore(duel.game.p1.score)}
                </strong>
                <RiftWardNexusBar nodes={duel.game.p1.nodes} variant="p1" />
                <RiftWardComboBadge side={duel.game.p1} now={duel.now} />
              </div>

              <div className="pm-missile-hud__center">
                <RiftWardTimerRing secondsLeft={duel.legTimeLeft} progress={duel.legProgress} />
                <span className="pm-missile-hud__target">HEDEF {formatScore(duel.pointsToWin)}</span>
              </div>

              <div className="pm-missile-hud__side is-p2">
                <GamePlayerPortrait src={opponent.portrait} variant="pink" active={canPlay} {...likeProps}/>
                <p>ZEYNEP</p>
                <strong
                  key={duel.scorePulseP2}
                  className={duel.scorePulseP2 > 0 ? 'is-pulse' : ''}
                >
                  {formatScore(duel.game.p2.score)}
                </strong>
                <RiftWardNexusBar nodes={duel.game.p2.nodes} variant="p2" />
              </div>

              <RiftWardScoreFloat floats={duel.scoreFloats} now={duel.now} />
            </section>

            <MissileCommandDuelArena
              p1={duel.game.p1}
              p2={duel.game.p2}
              now={duel.now}
              fxP1={duel.fxP1}
              fxP2={duel.fxP2}
              shakeP1={duel.shakeP1}
              disabled={!canPlay}
              onFire={duel.fireP1}
            />
          </div>

          {overlayMessage ? (
            <motion.div
              className={['pm-missile-overlay', overlayVariant(duel)].filter(Boolean).join(' ')}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              role="status"
            >
              {overlayBadge ? <span className="pm-missile-overlay__badge">{overlayBadge}</span> : null}
              <p className="pm-missile-overlay__title">{overlayMessage}</p>
              {overlaySub ? <p className="pm-missile-overlay__sub">{overlaySub}</p> : null}
              {!duel.running ? (
                <GameDuelRematchActions
                  onRestart={handleRestart}
                  onExit={handleBack}
                  opponentName={opponent.name}
                  primaryClassName="pm-missile-overlay__cta"
                />
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}
