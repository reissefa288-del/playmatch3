import { useCallback, useEffect, useRef, useState } from 'react'
import { pickTronBotDirection } from './utils/tronDuelBot'
import {
  createTronState,
  legShouldEnd,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  queueDirection,
  resolveLegWinner,
  ROUND_BREAK_MS,
  tickSide,
  WIN_ROUNDS,
  type Direction,
  type TronState,
} from './utils/tronDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

export function useTronDuel() {
  const [game, setGame] = useState<TronState>(() => createTronState(performance.now()))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
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
      const t = performance.now()
      const fresh = createTronState(t)
      fresh.roundNumber = g.roundNumber + 1
      fresh.p1.matchPoints = p1.matchPoints
      fresh.p2.matchPoints = p2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
    }, ROUND_BREAK_MS)
  }, [])

  endLegRef.current = endLeg

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return

    const tick = () => {
      const t = performance.now()
      setNow(t)

      if (legEndingRef.current || endedRef.current) {
        loopRef.current = window.requestAnimationFrame(tick)
        return
      }

      const prev = gameRef.current
      let p1 = tickSide(prev.p1, t)
      let p2 = queueDirection(prev.p2, pickTronBotDirection(prev.p2))
      p2 = tickSide(p2, t)

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

  const turnP1 = useCallback(
    (dir: Direction) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const p1 = queueDirection(gameRef.current.p1, dir)
      if (p1 === gameRef.current.p1) return
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    legEndingRef.current = false
    const t = performance.now()
    const fresh = createTronState(t)
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
    turnP1,
    restartMatch,
  }
}
