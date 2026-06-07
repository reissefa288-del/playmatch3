import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentVisible } from '../../shared/useDocumentVisible'
import { useManagedTimeout } from '../../shared/useManagedTimeout'
import { botThinkDelayMs, pickBotChoice } from './utils/mathDuelBot'
import {
  applyAnswer,
  createLane,
  createProblem,
  decayLaneFx,
  MATCH_ROUNDS,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  startNewRound,
  WIN_ROUNDS,
  type MathLaneState,
  type MathProblem,
} from './utils/mathDuelEngine'
import { playMathDuelSound } from './utils/mathDuelSounds'

type MatchResult = 'p1' | 'p2' | 'draw'

function spawnPair(seed: number, round: number, serial: number) {
  const p1 = createProblem(seed + 1, round, serial * 2)
  const p2 = createProblem(seed + 2, round, serial * 2 + 1)
  return { p1, p2 }
}

export function useMathDuel() {
  const initial = spawnPair(77, 1, 1)
  const [lane1, setLane1] = useState<MathLaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<MathLaneState>(() => createLane(2))
  const [problem1, setProblem1] = useState<MathProblem>(() => initial.p1)
  const [problem2, setProblem2] = useState<MathProblem>(() => initial.p2)
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchResult | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const problem1Ref = useRef(problem1)
  const problem2Ref = useRef(problem2)
  const roundSeedRef = useRef(77)
  const problemSerialRef = useRef(1)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const runningRef = useRef(running)
  const botTimerRef = useRef<number | null>(null)
  const fxTimerRef = useRef<number | null>(null)
  const lane1AdvanceRef = useRef<number | null>(null)
  const lane2AdvanceRef = useRef<number | null>(null)

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  problem1Ref.current = problem1
  problem2Ref.current = problem2
  runningRef.current = running

  const breakTimer = useManagedTimeout()
  const documentVisible = useDocumentVisible()

  const clearBot = useCallback(() => {
    if (botTimerRef.current) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const clearFx = useCallback(() => {
    if (fxTimerRef.current) window.clearTimeout(fxTimerRef.current)
    fxTimerRef.current = null
  }, [])

  const clearLaneTimers = useCallback(() => {
    if (lane1AdvanceRef.current) window.clearTimeout(lane1AdvanceRef.current)
    if (lane2AdvanceRef.current) window.clearTimeout(lane2AdvanceRef.current)
    lane1AdvanceRef.current = null
    lane2AdvanceRef.current = null
  }, [])

  const scheduleFxClear = useCallback(() => {
    clearFx()
    fxTimerRef.current = window.setTimeout(() => {
      setLane1((l) => decayLaneFx(l))
      setLane2((l) => decayLaneFx(l))
    }, 1100)
  }, [clearFx])

  const refreshLane1Ref = useRef<() => void>(() => {})
  const refreshLane2Ref = useRef<() => void>(() => {})
  const scheduleBotRef = useRef<() => void>(() => {})

  refreshLane1Ref.current = () => {
    if (endedRef.current || roundEndingRef.current) return
    problemSerialRef.current += 1
    const serial = problemSerialRef.current
    const p1 = createProblem(roundSeedRef.current + 1, roundNumberRef.current, serial * 2)
    problem1Ref.current = p1
    setProblem1(p1)
    setLane1((l) => ({
      ...l,
      selectedIndex: null,
      feedback: null,
      feedbackPoints: 0,
      feedbackToast: null,
      answered: false,
      buffLabel: null,
    }))
  }

  refreshLane2Ref.current = () => {
    if (endedRef.current || roundEndingRef.current) return
    problemSerialRef.current += 1
    const serial = problemSerialRef.current
    const p2 = createProblem(roundSeedRef.current + 2, roundNumberRef.current, serial * 2 + 1)
    problem2Ref.current = p2
    setProblem2(p2)
    setLane2((l) => ({
      ...l,
      selectedIndex: null,
      feedback: null,
      feedbackPoints: 0,
      feedbackToast: null,
      answered: false,
      buffLabel: null,
    }))
    scheduleBotRef.current()
  }

  const queueAdvanceLane1 = useCallback(() => {
    if (lane1AdvanceRef.current) window.clearTimeout(lane1AdvanceRef.current)
    lane1AdvanceRef.current = window.setTimeout(() => {
      lane1AdvanceRef.current = null
      refreshLane1Ref.current()
    }, 750)
  }, [])

  const queueAdvanceLane2 = useCallback(() => {
    if (lane2AdvanceRef.current) window.clearTimeout(lane2AdvanceRef.current)
    lane2AdvanceRef.current = window.setTimeout(() => {
      lane2AdvanceRef.current = null
      refreshLane2Ref.current()
    }, 750)
  }, [])

  scheduleBotRef.current = () => {
    clearBot()
    if (!runningRef.current || endedRef.current || roundEndingRef.current) return
    if (lane2Ref.current.answered) return
    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = window.setTimeout(() => {
      if (!runningRef.current || endedRef.current || lane2Ref.current.answered) return
      const p = problem2Ref.current
      const seed = roundSeedRef.current + p.id * 3
      const choice = pickBotChoice(p, lane2Ref.current, seed)
      const result = applyAnswer(lane2Ref.current, choice, p)
      lane2Ref.current = result.lane
      setLane2(result.lane)
      playMathDuelSound(result.correct ? 'correct' : 'wrong')
      scheduleFxClear()
      queueAdvanceLane2()
    }, delay)
  }

  const spawnBothRef = useRef<() => void>(() => {})

  spawnBothRef.current = () => {
    if (endedRef.current || roundEndingRef.current) return
    problemSerialRef.current += 1
    const { p1, p2 } = spawnPair(roundSeedRef.current, roundNumberRef.current, problemSerialRef.current)
    problem1Ref.current = p1
    problem2Ref.current = p2
    setProblem1(p1)
    setProblem2(p2)
    setLane1((l) => ({
      ...l,
      selectedIndex: null,
      feedback: null,
      feedbackPoints: 0,
      feedbackToast: null,
      answered: false,
      buffLabel: null,
    }))
    setLane2((l) => ({
      ...l,
      selectedIndex: null,
      feedback: null,
      feedbackPoints: 0,
      feedbackToast: null,
      answered: false,
      buffLabel: null,
    }))
    scheduleBotRef.current()
  }

  const endRoundRef = useRef<() => void>(() => {})

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    clearBot()
    clearLaneTimers()
    playMathDuelSound('round')

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

    breakTimer.schedule(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        playMathDuelSound(final === 'p1' ? 'win' : 'lose')
        setRoundMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }

      roundNumberRef.current += 1
      setRoundNumber(roundNumberRef.current)
      roundSeedRef.current += 17
      const reset = startNewRound(l1, l2)
      setLane1(reset.lane1)
      setLane2(reset.lane2)
      roundTimeRef.current = ROUND_SECONDS
      setRoundTimeLeft(ROUND_SECONDS)
      roundEndingRef.current = false
      setIsRoundBreak(false)
      setRoundMessage(null)
      spawnBothRef.current()
    }, ROUND_BREAK_MS)
  }, [breakTimer, clearBot, clearLaneTimers])

  endRoundRef.current = endRound

  const answerP1 = useCallback(
    (index: number) => {
      if (!runningRef.current || endedRef.current || roundEndingRef.current || lane1Ref.current.answered) return
      const p = problem1Ref.current
      const result = applyAnswer(lane1Ref.current, index, p)
      lane1Ref.current = result.lane
      setLane1(result.lane)
      playMathDuelSound(result.correct ? 'correct' : 'wrong')
      scheduleFxClear()
      queueAdvanceLane1()
    },
    [queueAdvanceLane1, scheduleFxClear],
  )

  useEffect(() => {
    spawnBothRef.current()
    return () => {
      clearBot()
      clearFx()
      clearLaneTimers()
      breakTimer.clear()
    }
  }, [breakTimer, clearBot, clearFx, clearLaneTimers])

  useEffect(() => {
    if (!running || endedRef.current || !documentVisible) return
    const tick = window.setInterval(() => {
      if (roundEndingRef.current) return
      if (performance.now() < roundBreakUntilRef.current) return
      roundTimeRef.current = Math.max(0, roundTimeRef.current - 1)
      setRoundTimeLeft(roundTimeRef.current)
      if (roundTimeRef.current === 0) endRoundRef.current()
    }, 1000)
    return () => window.clearInterval(tick)
  }, [documentVisible, running])

  const restartMatch = useCallback(() => {
    clearBot()
    clearFx()
    clearLaneTimers()
    breakTimer.clear()
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    roundSeedRef.current = 77 + Math.floor(Math.random() * 1000)
    problemSerialRef.current = 0
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    roundTimeRef.current = ROUND_SECONDS
    setLane1(createLane(1))
    setLane2(createLane(2))
    setWinner(null)
    setRoundMessage(null)
    setIsRoundBreak(false)
    setRunning(true)
    spawnBothRef.current()
  }, [breakTimer, clearBot, clearFx, clearLaneTimers])

  return {
    lane1,
    lane2,
    problem1,
    problem2,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    isRoundBreak,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    answerP1,
    restartMatch,
  }
}
