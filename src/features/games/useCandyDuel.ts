import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyMove,
  clearLaneFx,
  createLane,
  findBestMove,
  MATCH_ROUNDS,
  resolveRoundWinner,
  restartRound,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  WIN_ROUNDS,
  type CandyLaneState,
  type Cell,
} from './utils/candyDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

export function useCandyDuel() {
  const [lane1, setLane1] = useState<CandyLaneState>(() => createLane(1, 17))
  const [lane2, setLane2] = useState<CandyLaneState>(() => createLane(2, 17))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const seedRef = useRef(17)
  const botTimerRef = useRef<number | null>(null)
  const fxTimerRef = useRef<number | null>(null)

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const clearFx = useCallback(() => {
    if (fxTimerRef.current != null) window.clearTimeout(fxTimerRef.current)
    fxTimerRef.current = null
  }, [])

  const scheduleFxClear = useCallback(() => {
    clearFx()
    fxTimerRef.current = window.setTimeout(() => {
      setLane1((l) => clearLaneFx(l))
      setLane2((l) => clearLaneFx(l))
    }, 900)
  }, [clearFx])

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || roundEndingRef.current || isRoundBreak) return
    const delay = Math.max(420, 1500 - lane2Ref.current.combo * 60)
    botTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || roundEndingRef.current) return
      const mv = findBestMove(lane2Ref.current.board, seedRef.current + lane2Ref.current.score)
      if (mv) {
        const next = applyMove(lane2Ref.current, mv.from, mv.to, seedRef.current + 71)
        lane2Ref.current = next
        setLane2(next)
        scheduleFxClear()
      }
      scheduleBot()
    }, delay)
  }, [clearBot, isRoundBreak, scheduleFxClear])

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    clearBot()
    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)

    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }
    setLane1(l1)
    setLane2(l2)

    setRoundMessage(rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN')
    setIsRoundBreak(true)
    roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || roundNumberRef.current >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final = l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setRoundMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      roundNumberRef.current += 1
      setRoundNumber(roundNumberRef.current)
      seedRef.current += 113
      const reset = restartRound(l1, l2, seedRef.current)
      lane1Ref.current = reset.lane1
      lane2Ref.current = reset.lane2
      setLane1(reset.lane1)
      setLane2(reset.lane2)
      roundTimeRef.current = ROUND_SECONDS
      setRoundTimeLeft(ROUND_SECONDS)
      roundEndingRef.current = false
      setIsRoundBreak(false)
      setRoundMessage(null)
      scheduleBot()
    }, ROUND_BREAK_MS)
  }, [clearBot, scheduleBot])

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

  useEffect(() => {
    scheduleBot()
    return () => {
      clearBot()
      clearFx()
    }
  }, [clearBot, clearFx, scheduleBot])

  const selectCellP1 = useCallback(
    (cell: Cell) => {
      if (!running || roundEndingRef.current || isRoundBreak || endedRef.current) return
      const lane = lane1Ref.current
      if (!lane.selected) {
        const next = { ...lane, selected: cell, message: null }
        lane1Ref.current = next
        setLane1(next)
        return
      }
      const next = applyMove(lane, lane.selected, cell, seedRef.current + lane.score)
      lane1Ref.current = next
      setLane1(next)
      scheduleFxClear()
      scheduleBot()
    },
    [isRoundBreak, running, scheduleBot, scheduleFxClear],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    clearFx()
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 17 + Math.floor(Math.random() * 1000)
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    roundTimeRef.current = ROUND_SECONDS
    const l1 = createLane(1, seedRef.current)
    const l2 = createLane(2, seedRef.current + 99)
    lane1Ref.current = l1
    lane2Ref.current = l2
    setLane1(l1)
    setLane2(l2)
    setRoundMessage(null)
    setIsRoundBreak(false)
    setWinner(null)
    setRunning(true)
    scheduleBot()
  }, [clearBot, clearFx, scheduleBot])

  return {
    lane1,
    lane2,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    isRoundBreak,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    selectCellP1,
    restartMatch,
  }
}
