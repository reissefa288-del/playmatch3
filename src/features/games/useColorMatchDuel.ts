import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkDelayMs, pickBotTapIndex } from './utils/colorMatchBot'
import {
  applyHit,
  BOARD_CLEAR_MS,
  createLane,
  MATCH_ROUNDS,
  refreshLaneBoard,
  remainingMatches,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  TARGET_TIMEOUT_MS,
  WIN_ROUNDS,
  type ColorLaneState,
} from './utils/colorMatchEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'
type LaneId = 1 | 2

export function useColorMatchDuel() {
  const [lane1, setLane1] = useState<ColorLaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<ColorLaneState>(() => createLane(2))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const seedRef = useRef(401)
  const botTimerRef = useRef<number | null>(null)
  const targetTimer1Ref = useRef<number | null>(null)
  const targetTimer2Ref = useRef<number | null>(null)
  const scheduleBotRef = useRef<() => void>(() => {})

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const setLane = useCallback((lane: LaneId, next: ColorLaneState) => {
    if (lane === 1) {
      lane1Ref.current = next
      setLane1(next)
    } else {
      lane2Ref.current = next
      setLane2(next)
    }
  }, [])

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const clearTargetTimer = useCallback((lane: LaneId) => {
    const ref = lane === 1 ? targetTimer1Ref : targetTimer2Ref
    if (ref.current != null) window.clearTimeout(ref.current)
    ref.current = null
  }, [])

  const clearAllTargetTimers = useCallback(() => {
    clearTargetTimer(1)
    clearTargetTimer(2)
  }, [clearTargetTimer])

  const respawnLaneBoard = useCallback(
    (lane: LaneId, seedBump = 1) => {
      seedRef.current += seedBump
      const current = lane === 1 ? lane1Ref.current : lane2Ref.current
      const next = refreshLaneBoard(current, seedRef.current)
      setLane(lane, next)
    },
    [setLane],
  )

  const scheduleTargetTimeout = useCallback(
    (lane: LaneId) => {
      clearTargetTimer(lane)
      const ref = lane === 1 ? targetTimer1Ref : targetTimer2Ref
      ref.current = window.setTimeout(() => {
        if (endedRef.current || roundEndingRef.current) return
        const current = lane === 1 ? lane1Ref.current : lane2Ref.current
        setLane(lane, { ...current, combo: 0, comboMult: 1, lastFx: 'miss' })
        respawnLaneBoard(lane, 2)
        if (lane === 2) scheduleBotRef.current()
      }, TARGET_TIMEOUT_MS)
    },
    [clearTargetTimer, respawnLaneBoard, setLane],
  )

  const onBoardCleared = useCallback(
    (lane: LaneId) => {
      window.setTimeout(() => {
        if (endedRef.current || roundEndingRef.current) return
        respawnLaneBoard(lane, 2)
        scheduleTargetTimeout(lane)
        if (lane === 2) scheduleBotRef.current()
      }, BOARD_CLEAR_MS)
    },
    [respawnLaneBoard, scheduleTargetTimeout],
  )

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || roundEndingRef.current) return
    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || roundEndingRef.current) return
      const idx = pickBotTapIndex(lane2Ref.current, seedRef.current)
      const hit = applyHit(lane2Ref.current, idx)
      lane2Ref.current = hit
      setLane2(hit)
      if (hit.lastFx === 'hit' && remainingMatches(hit) === 0) {
        onBoardCleared(2)
        return
      }
      scheduleBotRef.current()
    }, delay)
  }, [clearBot, onBoardCleared])

  scheduleBotRef.current = scheduleBot

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    clearBot()
    clearAllTargetTimers()

    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }
    setLane1(l1)
    setLane2(l2)

    setRoundMessage(rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN')
    roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || roundNumberRef.current >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setRoundMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      roundNumberRef.current += 1
      setRoundNumber(roundNumberRef.current)
      const reset1 = createLane(1, seedRef.current + 3)
      const reset2 = createLane(2, seedRef.current + 5)
      reset1.matchPoints = l1.matchPoints
      reset2.matchPoints = l2.matchPoints
      lane1Ref.current = reset1
      lane2Ref.current = reset2
      setLane1(reset1)
      setLane2(reset2)
      roundTimeRef.current = ROUND_SECONDS
      setRoundTimeLeft(ROUND_SECONDS)
      roundEndingRef.current = false
      setRoundMessage(null)
      scheduleTargetTimeout(1)
      scheduleTargetTimeout(2)
      scheduleBotRef.current()
    }, ROUND_BREAK_MS)
  }, [clearAllTargetTimers, clearBot, scheduleTargetTimeout])

  useEffect(() => {
    scheduleTargetTimeout(1)
    scheduleTargetTimeout(2)
    scheduleBotRef.current()
    return () => {
      clearBot()
      clearAllTargetTimers()
    }
  }, [clearAllTargetTimers, clearBot, scheduleTargetTimeout])

  useEffect(() => {
    if (!running || endedRef.current) return
    const timer = window.setInterval(() => {
      if (roundEndingRef.current) return
      if (performance.now() < roundBreakUntilRef.current) return
      roundTimeRef.current = Math.max(0, roundTimeRef.current - 1)
      setRoundTimeLeft(roundTimeRef.current)
      if (roundTimeRef.current === 0) endRound()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endRound, running])

  const tapP1 = useCallback(
    (index: number) => {
      if (!running || roundEndingRef.current || endedRef.current) return
      const next = applyHit(lane1Ref.current, index)
      if (next.lastFx === null) return
      lane1Ref.current = next
      setLane1(next)
      if (next.lastFx === 'hit' && remainingMatches(next) === 0) {
        onBoardCleared(1)
      }
    },
    [onBoardCleared, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    clearAllTargetTimers()
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 401 + Math.floor(Math.random() * 500)
    const l1 = createLane(1, seedRef.current)
    const l2 = createLane(2, seedRef.current + 2)
    lane1Ref.current = l1
    lane2Ref.current = l2
    setLane1(l1)
    setLane2(l2)
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    roundTimeRef.current = ROUND_SECONDS
    setRoundMessage(null)
    setWinner(null)
    setRunning(true)
    scheduleTargetTimeout(1)
    scheduleTargetTimeout(2)
    scheduleBotRef.current()
  }, [clearAllTargetTimers, clearBot, scheduleTargetTimeout])

  return {
    lane1,
    lane2,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    tapP1,
    restartMatch,
  }
}
