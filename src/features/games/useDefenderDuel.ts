import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentVisible } from '../../shared/useDocumentVisible'
import { tickDefenderBot } from './utils/defenderDuelBot'
import {
  applyDefFxEvents,
  applyMuzzleFx,
  pruneDefParticles,
  type DefParticle,
} from './utils/defenderDuelFx'
import {
  createDefenderState,
  resolveDuelWinner,
  setShipY,
  SHIP_X,
  tickSide,
  tryFire,
  type DefenderState,
} from './utils/defenderDuelEngine'

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

export function useDefenderDuel() {
  const [game, setGame] = useState<DefenderState>(() => createDefenderState(performance.now()))
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [fxP1, setFxP1] = useState<DefParticle[]>([])
  const [fxP2, setFxP2] = useState<DefParticle[]>([])
  const [shakeP1Until, setShakeP1Until] = useState(0)
  const [muzzleP1Until, setMuzzleP1Until] = useState(0)

  const gameRef = useRef(game)
  const endedRef = useRef(false)
  const seedRef = useRef(77001)
  const lastTickRef = useRef(performance.now())
  const loopRef = useRef<number | null>(null)
  const fxP1Ref = useRef(fxP1)
  const fxP2Ref = useRef(fxP2)
  const shakeP1Ref = useRef(shakeP1Until)

  gameRef.current = game
  fxP1Ref.current = fxP1
  fxP2Ref.current = fxP2
  shakeP1Ref.current = shakeP1Until

  const documentVisible = useDocumentVisible()

  useEffect(() => {
    if (!documentVisible) return
    if (!running && endedRef.current) return

    const tick = () => {
      const t = performance.now()
      const dt = Math.min(48, t - lastTickRef.current)
      lastTickRef.current = t
      if (!endedRef.current) {
        setNow(t)
      }

      if (endedRef.current) {
        const p1Fx = pruneDefParticles(fxP1Ref.current, t)
        const p2Fx = pruneDefParticles(fxP2Ref.current, t)
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

      let p1Fx = pruneDefParticles(fxP1Ref.current, t)
      let p2Fx = pruneDefParticles(fxP2Ref.current, t)
      let shakeP1 = shakeP1Ref.current

      if (!endedRef.current && running) {
        const prev = gameRef.current
        const rand1 = mulberry32(seedRef.current++)
        const rand2 = mulberry32(seedRef.current + 63)

        const r1 = tickSide(prev.p1, dt, t, rand1)
        const r2 = tickSide(prev.p2, dt, t, rand2)

        let p1 = r1.side
        let p2 = r2.side

        const p1FxApplied = applyDefFxEvents(r1.events, t, p1Fx, shakeP1, true)
        p1Fx = p1FxApplied.particles
        shakeP1 = p1FxApplied.shakeUntil

        const p2FxApplied = applyDefFxEvents(r2.events, t, p2Fx, 0, false)
        p2Fx = p2FxApplied.particles

        const beforeP1Fire = p1.lastFireAt
        p1 = tryFire(p1, t)
        if (p1.lastFireAt !== beforeP1Fire) {
          const muzzle = applyMuzzleFx(SHIP_X + 4, p1.shipY, t, p1Fx)
          p1Fx = muzzle.particles
          setMuzzleP1Until(muzzle.muzzleFlashUntil)
        }

        const beforeP2Fire = p2.lastFireAt
        p2 = tickDefenderBot(p2, t)
        p2 = tryFire(p2, t)
        if (p2.lastFireAt !== beforeP2Fire) {
          const muzzle = applyMuzzleFx(SHIP_X + 4, p2.shipY, t, p2Fx)
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
  }, [documentVisible, running])

  const pointerShipP1 = useCallback(
    (clientY: number, rect: DOMRect) => {
      if (!running || endedRef.current) return
      const t = performance.now()
      const rel = (clientY - rect.top) / rect.height
      const y = 10 + rel * 80
      const p1 = setShipY(gameRef.current.p1, y, t)
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    seedRef.current = 77001 + Math.floor(Math.random() * 500)
    const t = performance.now()
    lastTickRef.current = t
    const fresh = createDefenderState(t)
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
    pointerShipP1,
    restartMatch,
  }
}
