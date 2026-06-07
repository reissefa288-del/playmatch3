import { useCallback, useEffect, useRef, useState } from 'react'
import { useManagedTimeout } from '../../shared/useManagedTimeout'
import {
  botThinkDelayMs,
  createBotMemory,
  runBotFlip,
  type BotMemory,
} from './utils/memoryDuelBot'
import {
  applyFlipBack,
  canFlipCard,
  createLane,
  decayLaneFx,
  FLIP_BACK_MS,
  flipCard,
  laneHasActiveFx,
  MATCH_ROUNDS,
  recoverStaleFlipBack,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  startNewRound,
  WIN_ROUNDS,
  type LaneEvent,
  type LaneState,
} from './utils/memoryDuelEngine'
import { playMemoryDuelSound, unlockMemoryDuelAudio } from './utils/memoryDuelSounds'

type MatchResult = 'p1' | 'p2' | 'draw'
type RoundWinner = 'p1' | 'p2' | 'draw'

export function useMemoryDuel() {
  const [lane1, setLane1] = useState<LaneState>(() => createLane(1, 11))
  const [lane2, setLane2] = useState<LaneState>(() => createLane(2, 11))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchResult | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundSeedRef = useRef(11)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundStartedAtRef = useRef(performance.now() / 1000)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const runningRef = useRef(running)
  const botMemoryRef = useRef<BotMemory>(createBotMemory())
  const botSeedRef = useRef(11)
  const flipBackTimerP1Ref = useRef<number | null>(null)
  const flipBackTimerP2Ref = useRef<number | null>(null)
  const botTimerRef = useRef<number | null>(null)
  const scheduleBotRef = useRef<() => void>(() => {})
  const timeDisplayRef = useRef(ROUND_SECONDS)

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  runningRef.current = running

  const breakTimer = useManagedTimeout()

  const syncLanes = useCallback((l1: LaneState, l2: LaneState) => {
    lane1Ref.current = l1
    lane2Ref.current = l2
    setLane1(l1)
    setLane2(l2)
  }, [])

  const clearFlipBack = useCallback((side?: 'p1' | 'p2') => {
    if (side === 'p1' || side === undefined) {
      if (flipBackTimerP1Ref.current != null) {
        window.clearTimeout(flipBackTimerP1Ref.current)
        flipBackTimerP1Ref.current = null
      }
    }
    if (side === 'p2' || side === undefined) {
      if (flipBackTimerP2Ref.current != null) {
        window.clearTimeout(flipBackTimerP2Ref.current)
        flipBackTimerP2Ref.current = null
      }
    }
  }, [])

  const clearBotTimer = useCallback(() => {
    if (botTimerRef.current != null) {
      window.clearTimeout(botTimerRef.current)
      botTimerRef.current = null
    }
  }, [])

  const playEvents = useCallback((events: LaneEvent[], combo: number) => {
    for (const event of events) {
      if (event === 'flip') playMemoryDuelSound('flip')
      else if (event === 'match') playMemoryDuelSound(combo > 1 ? 'combo' : 'match')
      else if (event === 'miss') playMemoryDuelSound('miss')
      else if (event === 'win') playMemoryDuelSound('round')
    }
  }, [])

  const finishRound = useCallback(
    (roundWinner: RoundWinner) => {
      if (roundEndingRef.current) return
      roundEndingRef.current = true
      clearFlipBack()
      clearBotTimer()

      let l1 = lane1Ref.current
      let l2 = lane2Ref.current
      if (roundWinner === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
      else if (roundWinner === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

      syncLanes(l1, l2)

      const msg =
        roundWinner === 'p1'
          ? 'ROUND — EMİR KAZANDI'
          : roundWinner === 'p2'
            ? 'ROUND — ZEYNEP KAZANDI'
            : 'ROUND BERABERE'

      setRoundMessage(msg)
      setIsRoundBreak(true)
      playMemoryDuelSound('round')

      const matchOver =
        l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || roundNumberRef.current >= MATCH_ROUNDS

      if (matchOver) {
        const matchWinner: MatchResult =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        endedRef.current = true
        setRunning(false)
        setWinner(matchWinner)
        playMemoryDuelSound(matchWinner === 'p1' ? 'win' : matchWinner === 'p2' ? 'lose' : 'round')
        roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS
        return
      }

      roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS
      breakTimer.schedule(() => {
        if (endedRef.current) return
        roundSeedRef.current += 17
        roundNumberRef.current += 1
        const seed = roundSeedRef.current
        botSeedRef.current = seed
        botMemoryRef.current = createBotMemory()
        roundTimeRef.current = ROUND_SECONDS
        roundStartedAtRef.current = performance.now() / 1000
        roundEndingRef.current = false
        setRoundNumber(roundNumberRef.current)
        setRoundTimeLeft(ROUND_SECONDS)
        setRoundMessage(null)
        setIsRoundBreak(false)
        syncLanes(startNewRound(l1, seed), startNewRound(l2, seed))
        scheduleBotRef.current()
      }, ROUND_BREAK_MS)
    },
    [breakTimer, clearBotTimer, clearFlipBack, syncLanes],
  )

  const checkRoundEnd = useCallback(() => {
    const l1 = lane1Ref.current
    const l2 = lane2Ref.current
    if (l1.finished || l2.finished) {
      finishRound(resolveRoundWinner(l1, l2))
      return true
    }
    if (roundTimeRef.current <= 0) {
      finishRound(resolveRoundWinner(l1, l2))
      return true
    }
    return false
  }, [finishRound])

  const scheduleFlipBack = useCallback(
    (side: 'p1' | 'p2') => {
      clearFlipBack(side)
      const timerRef = side === 'p1' ? flipBackTimerP1Ref : flipBackTimerP2Ref
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        if (side === 'p1') {
          const next = applyFlipBack(lane1Ref.current)
          if (next === lane1Ref.current) return
          syncLanes(next, lane2Ref.current)
        } else {
          const next = applyFlipBack(lane2Ref.current)
          if (next === lane2Ref.current) return
          syncLanes(lane1Ref.current, next)
        }
        if (!checkRoundEnd()) scheduleBotRef.current()
      }, FLIP_BACK_MS)
    },
    [checkRoundEnd, clearFlipBack, syncLanes],
  )

  const applyLaneResult = useCallback(
    (side: 'p1' | 'p2', result: ReturnType<typeof flipCard>) => {
      const combo = result.lane.combo
      playEvents(result.events, combo)
      if (side === 'p1') syncLanes(result.lane, lane2Ref.current)
      else syncLanes(lane1Ref.current, result.lane)

      if (result.lane.flipBackPending) {
        scheduleFlipBack(side)
        return
      }
      if (checkRoundEnd()) return
      if (side === 'p2') scheduleBotRef.current()
    },
    [checkRoundEnd, playEvents, scheduleFlipBack, syncLanes],
  )

  const scheduleBot = useCallback(() => {
    clearBotTimer()
    if (!runningRef.current || endedRef.current || roundEndingRef.current) return
    const lane = lane2Ref.current
    if (lane.finished || lane.inputLocked || lane.flipBackPending) return

    const delay = botThinkDelayMs(lane.combo, lane.openIndices.length === 1)
    botTimerRef.current = window.setTimeout(() => {
      botTimerRef.current = null
      if (!runningRef.current || endedRef.current || roundEndingRef.current) return
      const current = lane2Ref.current
      if (current.finished || current.inputLocked || current.flipBackPending) return

      const result = runBotFlip(current, botMemoryRef.current, botSeedRef.current)
      if (!result.moved) {
        scheduleBotRef.current()
        return
      }
      applyLaneResult('p2', { lane: result.lane, events: result.events })
    }, delay)
  }, [applyLaneResult, clearBotTimer])

  scheduleBotRef.current = scheduleBot

  const flipPlayerCard = useCallback(
    (index: number) => {
      if (!runningRef.current || endedRef.current || roundEndingRef.current) return
      const lane = lane1Ref.current
      if (!canFlipCard(lane)) return
      const result = flipCard(lane, index)
      if (result.events.length === 0) return
      applyLaneResult('p1', result)
    },
    [applyLaneResult],
  )

  const restartMatch = useCallback(() => {
    unlockMemoryDuelAudio()
    clearFlipBack()
    clearBotTimer()
    breakTimer.clear()
    endedRef.current = false
    roundEndingRef.current = false
    roundSeedRef.current = 11
    roundNumberRef.current = 1
    roundTimeRef.current = ROUND_SECONDS
    roundStartedAtRef.current = performance.now() / 1000
    botMemoryRef.current = createBotMemory()
    botSeedRef.current = 11
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    setRoundMessage(null)
    setIsRoundBreak(false)
    setRunning(true)
    setWinner(null)
    syncLanes(createLane(1, 11), createLane(2, 11))
    breakTimer.schedule(() => scheduleBotRef.current(), 280)
  }, [breakTimer, clearBotTimer, clearFlipBack, syncLanes])

  useEffect(() => {
    scheduleBotRef.current()
    return () => {
      clearFlipBack()
      clearBotTimer()
    }
  }, [clearBotTimer, clearFlipBack])

  useEffect(() => {
    if (!running || endedRef.current) return
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (!roundEndingRef.current && now >= roundBreakUntilRef.current) {
        const elapsed = now / 1000 - roundStartedAtRef.current
        roundTimeRef.current = Math.max(0, ROUND_SECONDS - elapsed)
        const display = Math.ceil(roundTimeRef.current)
        if (display !== timeDisplayRef.current) {
          timeDisplayRef.current = display
          setRoundTimeLeft(display)
        }

        let l1 = lane1Ref.current
        let l2 = lane2Ref.current
        const recovered1 = recoverStaleFlipBack(l1, now)
        const recovered2 = recoverStaleFlipBack(l2, now)
        if (recovered1 !== l1 || recovered2 !== l2) {
          syncLanes(recovered1, recovered2)
          if (!checkRoundEnd()) scheduleBotRef.current()
          l1 = recovered1
          l2 = recovered2
        }

        if (laneHasActiveFx(l1, now) || laneHasActiveFx(l2, now)) {
          const next1 = decayLaneFx(l1, dt, now)
          const next2 = decayLaneFx(l2, dt, now)
          if (next1 !== l1 || next2 !== l2) syncLanes(next1, next2)
        }

        if (roundTimeRef.current <= 0) checkRoundEnd()
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [checkRoundEnd, running, syncLanes])

  return {
    lane1,
    lane2,
    roundNumber,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    roundTimeLeft,
    roundMessage,
    isRoundBreak,
    running,
    winner,
    flipPlayerCard,
    restartMatch,
  }
}
