import { useCallback, useEffect, useRef, useState } from 'react'
import { botFalseStartChance, botReactionDelayMs } from './utils/reflexDuelBot'
import {
  activateGo,
  createReflexState,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  scheduleWait,
  applyTap,
  WIN_ROUNDS,
  type ReflexState,
} from './utils/reflexDuelEngine'

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

export function useReflexDuel() {
  const [game, setGame] = useState<ReflexState>(() => createReflexState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const runningRef = useRef(true)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(1501)
  const botTimerRef = useRef<number | null>(null)
  const loopRef = useRef<number | null>(null)

  gameRef.current = game
  runningRef.current = running

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const startDuel = useCallback(() => {
    const now = performance.now()
    const rand = mulberry32(seedRef.current++)
    const wait = scheduleWait(now, rand)
    setGame((g) => ({ ...g, ...wait, lastResult: null }))
  }, [])

  const checkLegEnd = useCallback((g: ReflexState) => {
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
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    const next = { ...g, lane1: l1, lane2: l2, phase: 'idle' as const }
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
      seedRef.current += 29
      const fresh = createReflexState()
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      startDuel()
    }, ROUND_BREAK_MS)
  }, [clearBot, startDuel])

  endLegRef.current = endLeg

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || legEndingRef.current) return

    const g = gameRef.current
    if (g.phase === 'wait' && botFalseStartChance()) {
      botTimerRef.current = window.setTimeout(() => {
        if (gameRef.current.phase !== 'wait') return
        const { state } = applyTap(gameRef.current, 2, performance.now())
        gameRef.current = state
        setGame(state)
        checkLegEnd(state)
      }, 200 + Math.random() * 400)
      return
    }

    if (g.phase === 'go') {
      const delay = botReactionDelayMs(0.88)
      botTimerRef.current = window.setTimeout(() => {
        if (gameRef.current.phase !== 'go') return
        const { state } = applyTap(gameRef.current, 2, performance.now())
        gameRef.current = state
        setGame(state)
        checkLegEnd(state)
      }, delay)
    }
  }, [checkLegEnd, clearBot])

  useEffect(() => {
    if (!running || legMessage) return
    startDuel()
  }, [running, legMessage, startDuel])

  useEffect(() => {
    if (!running || endedRef.current || legMessage) return

    const tick = () => {
      const now = performance.now()
      let g = gameRef.current

      if (g.phase === 'wait' && now >= g.goAt) {
        g = { ...g, ...activateGo(now) }
        gameRef.current = g
        setGame(g)
        scheduleBot()
      }

      if (g.phase === 'go' && now - g.goAt > 1200) {
        g = { ...g, phase: 'result', resultUntil: now + 800, lastResult: { winner: 'draw', p1Ms: null, p2Ms: null } }
        gameRef.current = g
        setGame(g)
      }

      if (g.phase === 'result' && now >= g.resultUntil) {
        checkLegEnd(g)
        if (!legEndingRef.current) startDuel()
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [checkLegEnd, legMessage, running, scheduleBot, startDuel])

  useEffect(() => {
    scheduleBot()
    return () => clearBot()
  }, [game.phase, scheduleBot, clearBot])

  const tapP1 = useCallback(() => {
    if (!running || legEndingRef.current || endedRef.current) return
    const { state } = applyTap(gameRef.current, 1, performance.now())
    gameRef.current = state
    setGame(state)
    checkLegEnd(state)
  }, [checkLegEnd, running])

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 1501 + Math.floor(Math.random() * 300)
    const fresh = createReflexState()
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
    tapP1,
    restartMatch,
  }
}
