import { useCallback, useEffect, useRef, useState } from 'react'
import { tickMissileCommandBot } from './utils/missileCommandDuelBot'
import {
  createMissileCommandState,
  launchCounter,
  legShouldEnd,
  LEG_DURATION_MS,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  tickSide,
  WIN_ROUNDS,
  type McFxEvent,
  type MissileCommandState,
} from './utils/missileCommandDuelEngine'
import {
  createScoreFloat,
  mergeParticles,
  pruneParticles,
  pruneScoreFloats,
  spawnBurstFx,
  spawnNodeLostFx,
  spawnPulseFireFx,
  spawnShardKillFx,
  type RwParticle,
  type RwScoreFloat,
} from './utils/riftWardFx'
import { playRiftWardSound, unlockRiftWardAudio } from './utils/riftWardSounds'

type MatchWinner = 'p1' | 'p2' | 'draw'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function applyFxEvents(
  events: McFxEvent[],
  side: 'p1' | 'p2',
  now: number,
  particles: RwParticle[],
  shakeUntil: number,
) {
  let nextParticles = particles
  let nextShake = shakeUntil

  for (const e of events) {
    switch (e.type) {
      case 'burst':
        playRiftWardSound('burst')
        nextParticles = mergeParticles(nextParticles, spawnBurstFx(e.x, e.y, now))
        break
      case 'shardKill':
        playRiftWardSound('shardKill')
        if (e.combo >= 3 && side === 'p1') playRiftWardSound('combo')
        nextParticles = mergeParticles(nextParticles, spawnShardKillFx(e.x, e.y, now))
        break
      case 'nodeLost':
        playRiftWardSound('nodeLost')
        nextParticles = mergeParticles(nextParticles, spawnNodeLostFx(e.x, e.y, now))
        if (side === 'p1') nextShake = Math.max(nextShake, now + 420)
        break
      case 'combo':
        if (side === 'p1' && e.level >= 2) playRiftWardSound('combo')
        break
      case 'waveUp':
        if (side === 'p1') playRiftWardSound('waveUp')
        break
      default:
        break
    }
  }

  return { particles: nextParticles, shakeUntil: nextShake }
}

export function useMissileCommandDuel() {
  const [game, setGame] = useState<MissileCommandState>(() =>
    createMissileCommandState(performance.now()),
  )
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [fxP1, setFxP1] = useState<RwParticle[]>([])
  const [fxP2, setFxP2] = useState<RwParticle[]>([])
  const [shakeP1Until, setShakeP1Until] = useState(0)
  const [scoreFloats, setScoreFloats] = useState<RwScoreFloat[]>([])
  const [scorePulseP1, setScorePulseP1] = useState(0)
  const [scorePulseP2, setScorePulseP2] = useState(0)

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(11007)
  const lastTickRef = useRef(performance.now())
  const loopRef = useRef<number | null>(null)
  const fxP1Ref = useRef(fxP1)
  const fxP2Ref = useRef(fxP2)
  const shakeP1Ref = useRef(shakeP1Until)
  const scoreFloatsRef = useRef(scoreFloats)

  gameRef.current = game
  fxP1Ref.current = fxP1
  fxP2Ref.current = fxP2
  shakeP1Ref.current = shakeP1Until
  scoreFloatsRef.current = scoreFloats

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true

    const g = gameRef.current
    const rw = resolveLegWinner(g.p1, g.p2)
    let p1 = { ...g.p1, shards: [], pulses: [] }
    let p2 = { ...g.p2, shards: [], pulses: [] }
    if (rw === 'p1') p1 = { ...p1, matchPoints: p1.matchPoints + 1 }
    else if (rw === 'p2') p2 = { ...p2, matchPoints: p2.matchPoints + 1 }

    if (rw === 'p1') playRiftWardSound('legWin')
    else if (rw === 'p2') playRiftWardSound('legLose')
    else playRiftWardSound('legDraw')

    const next = { ...g, p1, p2 }
    gameRef.current = next
    setGame(next)
    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : 'LEG KAYBETTİN')

    const matchOver =
      p1.matchPoints >= WIN_ROUNDS || p2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          p1.matchPoints > p2.matchPoints ? 'p1' : p2.matchPoints > p1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        if (final === 'p1') playRiftWardSound('matchWin')
        else if (final === 'p2') playRiftWardSound('matchLose')
        else playRiftWardSound('matchDraw')
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      seedRef.current += 61
      const t = performance.now()
      const fresh = createMissileCommandState(t)
      fresh.roundNumber = g.roundNumber + 1
      fresh.p1.matchPoints = p1.matchPoints
      fresh.p2.matchPoints = p2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      lastTickRef.current = t
    }, ROUND_BREAK_MS)
  }, [])

  endLegRef.current = endLeg

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return

    const tick = () => {
      const t = performance.now()
      const dt = Math.min(48, t - lastTickRef.current)
      lastTickRef.current = t
      setNow(t)

      if (legEndingRef.current || endedRef.current) {
        loopRef.current = window.requestAnimationFrame(tick)
        return
      }

      const prev = gameRef.current
      const rand1 = mulberry32(seedRef.current++)
      const rand2 = mulberry32(seedRef.current + 29)

      const r1 = tickSide(prev.p1, dt, t, rand1)
      const r2 = tickSide(prev.p2, dt, t, rand2)
      const p2 = tickMissileCommandBot(r2.side, t)

      let p1Fx = pruneParticles(fxP1Ref.current, t)
      let p2Fx = pruneParticles(fxP2Ref.current, t)
      let shakeP1 = shakeP1Ref.current

      const p1Applied = applyFxEvents(r1.events, 'p1', t, p1Fx, shakeP1)
      p1Fx = p1Applied.particles
      shakeP1 = p1Applied.shakeUntil

      const p2Applied = applyFxEvents(r2.events, 'p2', t, p2Fx, 0)
      p2Fx = p2Applied.particles

      fxP1Ref.current = p1Fx
      fxP2Ref.current = p2Fx
      shakeP1Ref.current = shakeP1
      setFxP1(p1Fx)
      setFxP2(p2Fx)
      setShakeP1Until(shakeP1)

      const g = { ...prev, p1: r1.side, p2 }
      gameRef.current = g
      setGame(g)

      let floats = pruneScoreFloats(scoreFloatsRef.current, t)
      const p1Delta = r1.side.score - prev.p1.score
      const p2Delta = p2.score - prev.p2.score
      if (p1Delta !== 0) {
        floats = [...floats, createScoreFloat('p1', p1Delta, t)]
        setScorePulseP1((k) => k + 1)
      }
      if (p2Delta !== 0) {
        floats = [...floats, createScoreFloat('p2', p2Delta, t)]
        setScorePulseP2((k) => k + 1)
      }
      scoreFloatsRef.current = floats
      setScoreFloats(floats)

      if (legShouldEnd(g, t)) endLegRef.current()

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [legMessage, running])

  const fireP1 = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      unlockRiftWardAudio()
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const tx = ((clientX - rect.left) / rect.width) * 100
      const ty = ((clientY - rect.top) / rect.height) * 100
      const t = performance.now()
      const p1 = launchCounter(gameRef.current.p1, tx, ty, t)
      if (p1 === gameRef.current.p1) return

      playRiftWardSound('pulse')
      const emitterX = p1.pulses[p1.pulses.length - 1]?.originX ?? tx
      const emitterY = p1.pulses[p1.pulses.length - 1]?.originY ?? 94
      const nextFx = mergeParticles(fxP1Ref.current, spawnPulseFireFx(emitterX, emitterY, t))
      fxP1Ref.current = nextFx
      setFxP1(nextFx)

      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 11007 + Math.floor(Math.random() * 500)
    const t = performance.now()
    lastTickRef.current = t
    const fresh = createMissileCommandState(t)
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
    fxP1Ref.current = []
    fxP2Ref.current = []
    shakeP1Ref.current = 0
    setFxP1([])
    setFxP2([])
    setShakeP1Until(0)
    scoreFloatsRef.current = []
    setScoreFloats([])
    setScorePulseP1(0)
    setScorePulseP2(0)
  }, [])

  const legTimeLeft = Math.max(0, Math.ceil((game.legEndsAt - now) / 1000))
  const legProgress = Math.max(0, Math.min(1, (game.legEndsAt - now) / LEG_DURATION_MS))

  return {
    game,
    now,
    legMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    legTimeLeft,
    legProgress,
    fireP1,
    restartMatch,
    fxP1,
    fxP2,
    shakeP1: now < shakeP1Until,
    scoreFloats,
    scorePulseP1,
    scorePulseP2,
  }
}
