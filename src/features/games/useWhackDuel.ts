import { useCallback, useEffect, useRef, useState } from 'react'
import { botWhackDelayMs } from './utils/whackDuelBot'
import {
  applyWhack,
  createWhackState,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  tickLane,
  WIN_ROUNDS,
  type WhackState,
} from './utils/whackDuelEngine'

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

export function useWhackDuel() {
  const [game, setGame] = useState<WhackState>(() => createWhackState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(3109)
  const botTimerRef = useRef<number | null>(null)
  const loopRef = useRef<number | null>(null)

  gameRef.current = game

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const checkLegEnd = useCallback((g: WhackState) => {
    if (g.lane1.score >= POINTS_TO_WIN || g.lane2.score >= POINTS_TO_WIN) {
      endLegRef.current()
    }
  }, [])

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    clearBot()

    const g = gameRef.current
    const rw = resolveLegWinner(g.lane1, g.lane2)
    let l1 = { ...g.lane1, activeCell: null, moleUntil: 0 }
    let l2 = { ...g.lane2, activeCell: null, moleUntil: 0 }
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    const next = { ...g, lane1: l1, lane2: l2 }
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
      seedRef.current += 23
      const fresh = createWhackState()
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

  const scheduleBotWhack = useCallback(() => {
    clearBot()
    if (endedRef.current || legEndingRef.current || legMessage) return

    const cell = gameRef.current.lane2.activeCell
    if (cell == null) return

    const delay = botWhackDelayMs()
    botTimerRef.current = window.setTimeout(() => {
      const g = gameRef.current
      if (g.lane2.activeCell !== cell || legEndingRef.current) return
      const rand = mulberry32(seedRef.current++)
      const lane2 = applyWhack(g.lane2, cell, performance.now(), rand)
      const next = { ...g, lane2 }
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)
    }, delay)
  }, [checkLegEnd, clearBot, legMessage])

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return

    const tick = () => {
      if (legEndingRef.current || endedRef.current) {
        loopRef.current = window.requestAnimationFrame(tick)
        return
      }

      const now = performance.now()
      const rand = mulberry32(seedRef.current++)
      const rand2 = mulberry32(seedRef.current + 7)
      const g = gameRef.current
      const lane1 = tickLane(g.lane1, now, rand)
      const lane2 = tickLane(g.lane2, now, rand2)

      if (lane1 !== g.lane1 || lane2 !== g.lane2) {
        const next = { ...g, lane1, lane2 }
        gameRef.current = next
        setGame(next)
        checkLegEnd(next)
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [checkLegEnd, legMessage, running])

  useEffect(() => {
    scheduleBotWhack()
    return () => clearBot()
  }, [game.lane2.activeCell, game.lane2.moleUntil, scheduleBotWhack, clearBot])

  const whackP1 = useCallback(
    (cell: number) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const g = gameRef.current
      const rand = mulberry32(seedRef.current++)
      const lane1 = applyWhack(g.lane1, cell, performance.now(), rand)
      if (lane1 === g.lane1) return
      const next = { ...g, lane1 }
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)
    },
    [checkLegEnd, legMessage, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 3109 + Math.floor(Math.random() * 500)
    const fresh = createWhackState()
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
    whackP1,
    restartMatch,
  }
}
