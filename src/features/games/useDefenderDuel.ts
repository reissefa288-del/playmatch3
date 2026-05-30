import { useCallback, useEffect, useRef, useState } from 'react'
import { tickDefenderBot } from './utils/defenderDuelBot'
import {
  createDefenderState,
  legShouldEnd,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  setShipY,
  tickSide,
  tryFire,
  tryMove,
  WIN_ROUNDS,
  type DefenderState,
  type VerticalDir,
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
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(77001)
  const lastTickRef = useRef(performance.now())
  const loopRef = useRef<number | null>(null)

  gameRef.current = game

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true

    const g = gameRef.current
    const rw = resolveLegWinner(g.p1, g.p2)
    let p1 = { ...g.p1 }
    let p2 = { ...g.p2 }
    if (rw === 'p1') p1 = { ...p1, matchPoints: p1.matchPoints + 1 }
    else if (rw === 'p2') p2 = { ...p2, matchPoints: p2.matchPoints + 1 }

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
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      seedRef.current += 89
      const t = performance.now()
      const fresh = createDefenderState(t)
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
      const rand2 = mulberry32(seedRef.current + 63)

      let p1 = tickSide(prev.p1, dt, t, rand1)
      let p2 = tickSide(prev.p2, dt, t, rand2)
      p2 = tickDefenderBot(p2, t)

      const g = { ...prev, p1, p2 }
      gameRef.current = g
      setGame(g)

      if (legShouldEnd(g, t)) endLegRef.current()

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [legMessage, running])

  const moveP1 = useCallback(
    (dir: VerticalDir) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const t = performance.now()
      const p1 = tryMove(gameRef.current.p1, dir, t)
      if (p1 === gameRef.current.p1) return
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const fireP1 = useCallback(() => {
    if (!running || legEndingRef.current || endedRef.current || legMessage) return
    const t = performance.now()
    const p1 = tryFire(gameRef.current.p1, t)
    if (p1 === gameRef.current.p1) return
    const next = { ...gameRef.current, p1 }
    gameRef.current = next
    setGame(next)
  }, [legMessage, running])

  const pointerShipP1 = useCallback(
    (clientY: number, rect: DOMRect) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const t = performance.now()
      const rel = (clientY - rect.top) / rect.height
      const y = 10 + rel * 80
      const p1 = setShipY(gameRef.current.p1, y, t)
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 77001 + Math.floor(Math.random() * 500)
    const t = performance.now()
    lastTickRef.current = t
    const fresh = createDefenderState(t)
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
  }, [])

  const legTimeLeft = Math.max(0, Math.ceil((game.legEndsAt - now) / 1000))

  return {
    game,
    now,
    legMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    legTimeLeft,
    moveP1,
    fireP1,
    pointerShipP1,
    restartMatch,
  }
}
