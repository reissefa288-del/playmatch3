import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentVisible } from '../../shared/useDocumentVisible'
import { loadGame1942DuelRuntime, type Game1942DuelRuntime } from './game1942DuelRuntime'
import type { Game1942State } from './utils/game1942DuelEngine'
import type { Y42Particle } from './utils/game1942DuelFx'

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

export function useGame1942Duel() {
  const runtimeRef = useRef<Game1942DuelRuntime | null>(null)
  const [engineReady, setEngineReady] = useState(false)
  const [game, setGame] = useState<Game1942State | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [fxP1, setFxP1] = useState<Y42Particle[]>([])
  const [fxP2, setFxP2] = useState<Y42Particle[]>([])
  const [shakeP1Until, setShakeP1Until] = useState(0)
  const [muzzleP1Until, setMuzzleP1Until] = useState(0)

  const gameRef = useRef<Game1942State | null>(null)
  const endedRef = useRef(false)
  const seedRef = useRef(194201)
  const lastTickRef = useRef(performance.now())
  const loopRef = useRef<number | null>(null)
  const fxP1Ref = useRef(fxP1)
  const fxP2Ref = useRef(fxP2)
  const shakeP1Ref = useRef(shakeP1Until)

  fxP1Ref.current = fxP1
  fxP2Ref.current = fxP2
  shakeP1Ref.current = shakeP1Until

  const documentVisible = useDocumentVisible()

  useEffect(() => {
    let cancelled = false
    loadGame1942DuelRuntime().then((runtime) => {
      if (cancelled) return
      runtimeRef.current = runtime
      const initial = runtime.engine.createGame1942State(performance.now())
      gameRef.current = initial
      setGame(initial)
      setEngineReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!engineReady || !gameRef.current || !documentVisible) return
    if (!running && endedRef.current) return

    const runtime = runtimeRef.current
    if (!runtime) return

    const {
      engine: { tickSide, tryShoot, resolveDuelWinner, SHIP_Y },
      bot: { tickGame1942Bot },
      fx: { pruneY42Particles, applyY42FxEvents, applyY42MuzzleFx },
    } = runtime

    const tick = () => {
      const t = performance.now()
      const dt = Math.min(48, t - lastTickRef.current)
      lastTickRef.current = t
      if (!endedRef.current) {
        setNow(t)
      }

      if (endedRef.current) {
        const p1Fx = pruneY42Particles(fxP1Ref.current, t)
        const p2Fx = pruneY42Particles(fxP2Ref.current, t)
        const shakeP1 = shakeP1Ref.current
        const hasFx = p1Fx.length > 0 || p2Fx.length > 0 || shakeP1 > t
        if (hasFx) {
          fxP1Ref.current = p1Fx
          fxP2Ref.current = p2Fx
          setFxP1(p1Fx)
          setFxP2(p2Fx)
          loopRef.current = window.requestAnimationFrame(tick)
        }
        return
      }

      let p1Fx = pruneY42Particles(fxP1Ref.current, t)
      let p2Fx = pruneY42Particles(fxP2Ref.current, t)
      let shakeP1 = shakeP1Ref.current

      if (!endedRef.current && running && gameRef.current) {
        const prev = gameRef.current
        const rand1 = mulberry32(seedRef.current++)
        const rand2 = mulberry32(seedRef.current + 19)

        const r1 = tickSide(prev.p1, dt, t, rand1)
        const r2 = tickSide(prev.p2, dt, t, rand2)

        let p1 = r1.side
        let p2 = r2.side

        const p1FxApplied = applyY42FxEvents(r1.events, t, p1Fx, shakeP1, true)
        p1Fx = p1FxApplied.particles
        shakeP1 = p1FxApplied.shakeUntil

        const p2FxApplied = applyY42FxEvents(r2.events, t, p2Fx, 0, false)
        p2Fx = p2FxApplied.particles

        p2 = tickGame1942Bot(p2, t)

        const beforeP1Fire = p1.lastShotAt
        p1 = tryShoot(p1, t)
        if (p1.lastShotAt !== beforeP1Fire) {
          const muzzle = applyY42MuzzleFx(p1.shipX, SHIP_Y - 6, t, p1Fx)
          p1Fx = muzzle.particles
          setMuzzleP1Until(muzzle.muzzleFlashUntil)
        }

        const beforeP2Fire = p2.lastShotAt
        p2 = tryShoot(p2, t)
        if (p2.lastShotAt !== beforeP2Fire) {
          const muzzle = applyY42MuzzleFx(p2.shipX, SHIP_Y - 6, t, p2Fx)
          p2Fx = muzzle.particles
        }

        const next = { ...prev, p1, p2 }
        gameRef.current = next
        setGame(next)

        const duelWinner = resolveDuelWinner(next)
        if (duelWinner) {
          setWinner(duelWinner)
          setRunning(false)
          endedRef.current = true
        }
      }

      fxP1Ref.current = p1Fx
      fxP2Ref.current = p2Fx
      shakeP1Ref.current = shakeP1
      setFxP1(p1Fx)
      setFxP2(p2Fx)
      setShakeP1Until(shakeP1)

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [documentVisible, engineReady, running])

  const setShipX = useCallback(
    (x: number) => {
      const runtime = runtimeRef.current
      if (!runtime || !running || endedRef.current || !gameRef.current) return
      const p1 = runtime.engine.moveShip(gameRef.current.p1, x)
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [running],
  )

  const restartMatch = useCallback(() => {
    const runtime = runtimeRef.current
    if (!runtime) return
    endedRef.current = false
    seedRef.current = 194201 + Math.floor(Math.random() * 500)
    const t = performance.now()
    lastTickRef.current = t
    const fresh = runtime.engine.createGame1942State(t)
    gameRef.current = fresh
    setGame(fresh)
    setWinner(null)
    setFxP1([])
    setFxP2([])
    setShakeP1Until(0)
    setMuzzleP1Until(0)
    fxP1Ref.current = []
    fxP2Ref.current = []
    shakeP1Ref.current = 0
    setRunning(true)
  }, [])

  return {
    engineReady,
    game,
    now,
    running,
    winner,
    fxP1,
    fxP2,
    shakeP1Until,
    muzzleP1Until,
    setShipX,
    restartMatch,
    enemyGlyph: engineReady ? (runtimeRef.current?.engine.enemyGlyph ?? null) : null,
  }
}
