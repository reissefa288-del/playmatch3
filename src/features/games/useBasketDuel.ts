import { useCallback, useEffect, useRef, useState } from 'react'
import { botMarkerPosition, botShootDelayMs } from './utils/basketDuelBot'
import {
  createBasketState,
  endFlight,
  legShouldEnd,
  MATCH_ROUNDS,
  nextTurn,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  shoot,
  tickMarker,
  WIN_ROUNDS,
  type BasketState,
} from './utils/basketDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

export function useBasketDuel() {
  const [game, setGame] = useState<BasketState>(() => createBasketState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const lastTickRef = useRef(performance.now())
  const botTimerRef = useRef<number | null>(null)
  const loopRef = useRef<number | null>(null)

  gameRef.current = game

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    clearBot()

    const g = gameRef.current
    const rw = resolveLegWinner(g.lane1, g.lane2)
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    const next: BasketState = { ...g, lane1: l1, lane2: l2, phase: 'idle' }
    gameRef.current = next
    setGame(next)

    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : 'LEG KAYBETTİN')

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      const fresh = createBasketState()
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
    }, ROUND_BREAK_MS)
  }, [clearBot])

  endLegRef.current = endLeg

  const checkLegEnd = useCallback((g: BasketState) => {
    if (legShouldEnd(g)) endLegRef.current()
  }, [])

  const scheduleBotShot = useCallback(() => {
    clearBot()
    if (endedRef.current || legEndingRef.current || legMessage) return

    const g = gameRef.current
    if (g.phase !== 'aim' || g.turn !== 2) return

    botTimerRef.current = window.setTimeout(() => {
      const cur = gameRef.current
      if (cur.phase !== 'aim' || cur.turn !== 2 || legEndingRef.current) return

      const aimed = { ...cur, marker: botMarkerPosition() }
      const shotState = shoot(aimed, 2, performance.now())
      gameRef.current = shotState
      setGame(shotState)
      checkLegEnd(shotState)
    }, botShootDelayMs())
  }, [checkLegEnd, clearBot, legMessage])

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTickRef.current)
      lastTickRef.current = now

      if (legEndingRef.current || endedRef.current) {
        loopRef.current = window.requestAnimationFrame(tick)
        return
      }

      let g = gameRef.current

      if (g.phase === 'aim' && g.turn === 1) {
        const moved = tickMarker(g, dt)
        if (moved !== g) {
          g = moved
          gameRef.current = g
          setGame(g)
        }
      }

      if (g.phase === 'flight' && now >= g.flightUntil) {
        g = endFlight(g, now)
        gameRef.current = g
        setGame(g)
        checkLegEnd(g)
      }

      if (g.phase === 'turn-end' && now >= g.turnEndUntil && !legEndingRef.current) {
        if (!legShouldEnd(g)) {
          g = nextTurn(g)
          gameRef.current = g
          setGame(g)
        }
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    lastTickRef.current = performance.now()
    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [checkLegEnd, legMessage, running])

  useEffect(() => {
    scheduleBotShot()
    return () => clearBot()
  }, [game.turn, game.phase, scheduleBotShot, clearBot])

  const shootP1 = useCallback(() => {
    if (!running || legEndingRef.current || endedRef.current || legMessage) return
    const now = performance.now()
    const next = shoot(gameRef.current, 1, now)
    if (next === gameRef.current) return
    gameRef.current = next
    setGame(next)
    checkLegEnd(next)
  }, [checkLegEnd, legMessage, running])

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    const fresh = createBasketState()
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
  }, [clearBot])

  return {
    game,
    legMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    shootP1,
    restartMatch,
  }
}
