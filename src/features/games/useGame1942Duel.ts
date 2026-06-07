import { useCallback, useEffect, useRef, useState } from 'react'
import { tickGame1942Bot } from './utils/game1942DuelBot'
import {
  applyY42FxEvents,
  applyY42MuzzleFx,
  pruneY42Particles,
  type Y42Particle,
} from './utils/game1942DuelFx'
import {
  createGame1942State,
  moveShip,
  resolveDuelWinner,
  SHIP_Y,
  tickSide,
  tryShoot,
  type Game1942State,
} from './utils/game1942DuelEngine'

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
  const [game, setGame] = useState<Game1942State>(() => createGame1942State(performance.now()))
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [fxP1, setFxP1] = useState<Y42Particle[]>([])
  const [fxP2, setFxP2] = useState<Y42Particle[]>([])
  const [shakeP1Until, setShakeP1Until] = useState(0)
  const [muzzleP1Until, setMuzzleP1Until] = useState(0)

  const gameRef = useRef(game)
  const endedRef = useRef(false)
  const seedRef = useRef(194201)
  const lastTickRef = useRef(performance.now())
  const loopRef = useRef<number | null>(null)
  const fxP1Ref = useRef(fxP1)
  const fxP2Ref = useRef(fxP2)
  const shakeP1Ref = useRef(shakeP1Until)

  gameRef.current = game
  fxP1Ref.current = fxP1
  fxP2Ref.current = fxP2
  shakeP1Ref.current = shakeP1Until

  useEffect(() => {
    if (!running && endedRef.current) return

    const tick = () => {
      const t = performance.now()
      const dt = Math.min(48, t - lastTickRef.current)
      lastTickRef.current = t
      setNow(t)

      let p1Fx = pruneY42Particles(fxP1Ref.current, t)
      let p2Fx = pruneY42Particles(fxP2Ref.current, t)
      let shakeP1 = shakeP1Ref.current

      if (!endedRef.current && running) {
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

        const g = { ...prev, p1, p2 }
        gameRef.current = g
        setGame(g)

        const duelWinner = resolveDuelWinner(g)
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
  }, [running])

  const setShipX = useCallback(
    (x: number) => {
      if (!running || endedRef.current) return
      const p1 = moveShip(gameRef.current.p1, x)
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    seedRef.current = 194201 + Math.floor(Math.random() * 500)
    const t = performance.now()
    lastTickRef.current = t
    const fresh = createGame1942State(t)
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
  }
}
