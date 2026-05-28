import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkDelayMs, pickBotSwap } from './utils/neonCrushBot'
import {
  comboMultiplier,
  createBoard,
  createLane,
  MATCH_ROUNDS,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  ROUND_TARGET_SCORE,
  trySwap,
  WIN_ROUNDS,
  type NeonLaneState,
} from './utils/neonCrushEngine'

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

export function useNeonCrushDuel() {
  const [lane1, setLane1] = useState<NeonLaneState>(() => createLane(1, 501))
  const [lane2, setLane2] = useState<NeonLaneState>(() => createLane(2, 709))
  const [selected, setSelected] = useState<number | null>(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [boardKey, setBoardKey] = useState(0)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const seedRef = useRef(501)
  const botTimerRef = useRef<number | null>(null)
  const scheduleBotRef = useRef<() => void>(() => {})

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const bumpBoards = useCallback((seedBump: number) => {
    seedRef.current += seedBump
    const rand = mulberry32(seedRef.current)
    const b1 = createBoard(seedRef.current + 3)
    const b2 = createBoard(seedRef.current + 17)
    setLane1((l) => ({ ...l, cells: b1, combo: 0, comboMult: 1 }))
    setLane2((l) => ({ ...l, cells: b2, combo: 0, comboMult: 1 }))
    lane1Ref.current = { ...lane1Ref.current, cells: b1, combo: 0, comboMult: 1 }
    lane2Ref.current = { ...lane2Ref.current, cells: b2, combo: 0, comboMult: 1 }
    setBoardKey((k) => k + 1)
    void rand
  }, [])

  const applyLaneScore = useCallback((lane: NeonLaneState, gain: number, combo: number): NeonLaneState => {
    const roundScore = lane.roundScore + gain
    const mult = comboMultiplier(combo)
    return {
      ...lane,
      score: lane.score + gain,
      roundScore,
      combo,
      comboMult: mult,
    }
  }, [])

  const checkRoundEnd = useCallback(() => {
    if (roundEndingRef.current || endedRef.current) return
    if (lane1Ref.current.roundScore < ROUND_TARGET_SCORE && lane2Ref.current.roundScore < ROUND_TARGET_SCORE) {
      return
    }
    endRoundRef.current()
  }, [])

  const endRoundRef = useRef<() => void>(() => {})

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    clearBot()
    setSelected(null)

    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }
    setLane1(l1)
    setLane2(l2)

    setRoundMessage(
      rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN',
    )
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
      const reset1 = createLane(1, seedRef.current + 41)
      const reset2 = createLane(2, seedRef.current + 59)
      reset1.matchPoints = l1.matchPoints
      reset1.score = l1.score
      reset2.matchPoints = l2.matchPoints
      reset2.score = l2.score
      lane1Ref.current = reset1
      lane2Ref.current = reset2
      setLane1(reset1)
      setLane2(reset2)
      roundTimeRef.current = ROUND_SECONDS
      setRoundTimeLeft(ROUND_SECONDS)
      roundEndingRef.current = false
      setRoundMessage(null)
      setBoardKey((k) => k + 1)
      scheduleBotRef.current()
    }, ROUND_BREAK_MS)
  }, [clearBot])

  endRoundRef.current = endRound

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || roundEndingRef.current) return
    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || roundEndingRef.current) return
      const [a, b] = pickBotSwap(lane2Ref.current.cells, seedRef.current)
      if (a < 0) {
        scheduleBotRef.current()
        return
      }
      const rand = mulberry32(seedRef.current++)
      const result = trySwap(lane2Ref.current.cells, a, b, rand)
      if (!result.ok) {
        bumpBoards(2)
        scheduleBotRef.current()
        return
      }
      const next = applyLaneScore(
        { ...lane2Ref.current, cells: result.board },
        result.scoreGain,
        result.combo,
      )
      lane2Ref.current = next
      setLane2(next)
      setBoardKey((k) => k + 1)
      checkRoundEnd()
      scheduleBotRef.current()
    }, delay)
  }, [applyLaneScore, bumpBoards, checkRoundEnd, clearBot])

  scheduleBotRef.current = scheduleBot

  useEffect(() => {
    scheduleBotRef.current()
    return () => clearBot()
  }, [clearBot])

  useEffect(() => {
    if (!running || endedRef.current) return
    const timer = window.setInterval(() => {
      if (roundEndingRef.current) return
      if (performance.now() < roundBreakUntilRef.current) return
      roundTimeRef.current = Math.max(0, roundTimeRef.current - 1)
      setRoundTimeLeft(roundTimeRef.current)
      if (roundTimeRef.current === 0) endRoundRef.current()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const tapCell = useCallback(
    (index: number) => {
      if (!running || roundEndingRef.current || endedRef.current) return

      if (selected == null) {
        setSelected(index)
        return
      }
      if (selected === index) {
        setSelected(null)
        return
      }

      const rand = mulberry32(seedRef.current++)
      const result = trySwap(lane1Ref.current.cells, selected, index, rand)
      setSelected(null)
      if (!result.ok) return

      const next = applyLaneScore(
        { ...lane1Ref.current, cells: result.board },
        result.scoreGain,
        result.combo,
      )
      lane1Ref.current = next
      setLane1(next)
      setBoardKey((k) => k + 1)
      checkRoundEnd()
    },
    [applyLaneScore, checkRoundEnd, running, selected],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 501 + Math.floor(Math.random() * 800)
    const l1 = createLane(1, seedRef.current)
    const l2 = createLane(2, seedRef.current + 99)
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
    setSelected(null)
    setBoardKey((k) => k + 1)
    scheduleBotRef.current()
  }, [clearBot])

  return {
    lane1,
    lane2,
    selected,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    roundTarget: ROUND_TARGET_SCORE,
    boardKey,
    tapCell,
    restartMatch,
  }
}
