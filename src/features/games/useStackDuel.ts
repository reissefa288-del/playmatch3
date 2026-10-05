import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentVisible } from '../../shared/useDocumentVisible'
import { useManagedTimeout } from '../../shared/useManagedTimeout'
import { useManagedTimers } from '../../shared/useManagedTimers'
import { botThinkDelayMs, shouldBotDrop } from './utils/stackDuelBot'
import {
  beginFall,
  commitFall,
  createLane,
  decayLaneFx,
  FALL_DURATION_MS,
  MATCH_ROUNDS,
  nudgeActive,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  shouldEndRoundEarly,
  startNewRound,
  TARGET_SCORE,
  tickActive,
  TICK_MS,
  WIN_ROUNDS,
  type StackLaneEvent,
  type StackLaneState,
} from './utils/stackDuelEngine'
import { playStackDuelSound } from './utils/stackDuelSounds'

type MatchResult = 'p1' | 'p2' | 'draw'
type RoundScoreSummary = { p1: number; p2: number; winner: MatchResult }

export function useStackDuel() {
  const documentVisible = useDocumentVisible()
  const [lane1, setLane1] = useState<StackLaneState>(() => createLane(1, 42))
  const [lane2, setLane2] = useState<StackLaneState>(() => createLane(2, 42))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [roundScoreSummary, setRoundScoreSummary] = useState<RoundScoreSummary | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchResult | null>(null)
  const [matchPoints, setMatchPoints] = useState({ p1: 0, p2: 0 })

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundSeedRef = useRef(42)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const runningRef = useRef(running)
  const botTimerRef = useRef<number | null>(null)
  const botCommitTimerRef = useRef<number | null>(null)
  const popTimerRef = useRef<number | null>(null)
  const syncTickRef = useRef(0)
  const lastTickRef = useRef(performance.now())

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  runningRef.current = running

  const breakTimer = useManagedTimeout()
  const duelTimers = useManagedTimers()

  const clearTimerRef = useCallback(
    (ref: { current: number | null }) => {
      if (ref.current != null) duelTimers.clear(ref.current)
      ref.current = null
    },
    [duelTimers],
  )

  const playLaneEvent = useCallback((event: StackLaneEvent, combo: number) => {
    if (event === 'perfect') playStackDuelSound('perfect')
    else if (event === 'good') playStackDuelSound(combo > 1 ? 'perfect' : 'drop')
    else if (event === 'miss') playStackDuelSound('miss')
    else if (event === 'place') playStackDuelSound('drop')
  }, [])

  const clearPopLater = useCallback(() => {
    clearTimerRef(popTimerRef)
    popTimerRef.current = duelTimers.schedule(() => {
      popTimerRef.current = null
      startTransition(() => {
        setLane1((l) => (l.perfectPop ? { ...l, perfectPop: null } : l))
        setLane2((l) => (l.perfectPop ? { ...l, perfectPop: null } : l))
      })
    }, 900)
  }, [clearTimerRef, duelTimers])

  const clearBotCommitTimer = useCallback(() => {
    clearTimerRef(botCommitTimerRef)
  }, [clearTimerRef])

  const endRoundRef = useRef<() => void>(() => {})
  const tryEndRoundEarlyRef = useRef<() => void>(() => {})

  const scheduleBot = useCallback(() => {
    clearTimerRef(botTimerRef)
    clearBotCommitTimer()
    if (!runningRef.current || endedRef.current || roundEndingRef.current) return

    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = duelTimers.schedule(() => {
      botTimerRef.current = null
      if (!runningRef.current || endedRef.current) return
      const lane = lane2Ref.current
      const seed = roundSeedRef.current + lane.blocks.length
      if (shouldBotDrop(lane, seed) && !lane.falling) {
        const started = beginFall(lane)
        if (started) {
          lane2Ref.current = started
          setLane2(started)
          clearBotCommitTimer()
          botCommitTimerRef.current = duelTimers.schedule(() => {
            botCommitTimerRef.current = null
            setLane2((l) => {
              const result = commitFall(l, seed + 7)
              lane2Ref.current = result.lane
              playLaneEvent(result.event, result.lane.combo)
              if (result.lifeRecovered) playStackDuelSound('life')
              if (result.lane.score >= TARGET_SCORE) queueMicrotask(() => endRoundRef.current())
              else queueMicrotask(() => tryEndRoundEarlyRef.current())
              return result.lane
            })
          }, FALL_DURATION_MS + 40)
        }
      }
      scheduleBot()
    }, delay)
  }, [clearBotCommitTimer, clearTimerRef, duelTimers, playLaneEvent])

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    const s1 = lane1Ref.current.score
    const s2 = lane2Ref.current.score
    setRoundScoreSummary({ p1: s1, p2: s2, winner: rw })
    const msg =
      rw === 'p1' ? 'EMİR KAZANDI' : rw === 'p2' ? 'ZEYNEP KAZANDI' : 'ROUND BERABERE'
    setRoundMessage(msg)
    playStackDuelSound('round')
    roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS
    setIsRoundBreak(true)

    setMatchPoints((mp) => {
      const next = {
        p1: mp.p1 + (rw === 'p1' ? 1 : 0),
        p2: mp.p2 + (rw === 'p2' ? 1 : 0),
      }

      breakTimer.schedule(() => {
        if (next.p1 >= WIN_ROUNDS || next.p2 >= WIN_ROUNDS) {
          endedRef.current = true
          setRunning(false)
          setWinner(next.p1 > next.p2 ? 'p1' : next.p2 > next.p1 ? 'p2' : 'draw')
          playStackDuelSound(next.p1 > next.p2 ? 'win' : 'lose')
          setRoundMessage(null)
          setRoundScoreSummary(null)
          setIsRoundBreak(false)
          roundEndingRef.current = false
          roundBreakUntilRef.current = 0
          return
        }

        if (roundNumberRef.current >= MATCH_ROUNDS) {
          endedRef.current = true
          setRunning(false)
          const final = next.p1 > next.p2 ? 'p1' : next.p2 > next.p1 ? 'p2' : 'draw'
          setWinner(final)
          playStackDuelSound(final === 'p1' ? 'win' : 'lose')
          setRoundMessage(null)
          setRoundScoreSummary(null)
          setIsRoundBreak(false)
          roundEndingRef.current = false
          roundBreakUntilRef.current = 0
          return
        }

        roundNumberRef.current += 1
        setRoundNumber(roundNumberRef.current)
        roundSeedRef.current += 13
        roundTimeRef.current = ROUND_SECONDS
        setRoundTimeLeft(ROUND_SECONDS)
        const l1 = startNewRound(lane1Ref.current, roundSeedRef.current)
        const l2 = startNewRound(lane2Ref.current, roundSeedRef.current + 5)
        lane1Ref.current = l1
        lane2Ref.current = l2
        setLane1(l1)
        setLane2(l2)
        roundEndingRef.current = false
        roundBreakUntilRef.current = 0
        setIsRoundBreak(false)
        setRoundMessage(null)
        setRoundScoreSummary(null)
        scheduleBot()
      }, ROUND_BREAK_MS)

      return next
    })
  }, [breakTimer, scheduleBot])

  endRoundRef.current = endRound

  const tryEndRoundEarly = useCallback(() => {
    if (roundEndingRef.current || !runningRef.current || endedRef.current) return
    if (shouldEndRoundEarly(lane1Ref.current, lane2Ref.current)) {
      endRoundRef.current()
    }
  }, [])

  tryEndRoundEarlyRef.current = tryEndRoundEarly

  const commitDropP1 = useCallback(() => {
    const seed = roundSeedRef.current + roundNumberRef.current
    setLane1((l) => {
      if (!l.falling) return l
      const result = commitFall(l, seed)
      playLaneEvent(result.event, result.lane.combo)
      if (result.lifeRecovered) playStackDuelSound('life')
      lane1Ref.current = result.lane
      if (result.lane.score >= TARGET_SCORE) queueMicrotask(() => endRoundRef.current())
      else queueMicrotask(() => tryEndRoundEarlyRef.current())
      return result.lane
    })
    clearPopLater()
  }, [clearPopLater, playLaneEvent])

  const startDropP1 = useCallback(() => {
    if (!runningRef.current || roundEndingRef.current) return false
    if (roundBreakUntilRef.current && performance.now() < roundBreakUntilRef.current) return false
    let started = false
    setLane1((l) => {
      const next = beginFall(l)
      if (!next) return l
      started = true
      lane1Ref.current = next
      return next
    })
    return started
  }, [])

  useEffect(() => {
    if (!runningRef.current || roundEndingRef.current) return
    if (shouldEndRoundEarly(lane1, lane2)) endRound()
  }, [lane1.lives, lane1.finished, lane2.lives, lane2.finished, endRound])

  useEffect(() => {
    if (!documentVisible) return
    const id = window.setInterval(() => {
      if (!runningRef.current || endedRef.current) return
      const now = performance.now()
      if (roundBreakUntilRef.current && now < roundBreakUntilRef.current) return

      const dt = Math.min(0.05, (now - lastTickRef.current) / 1000)
      lastTickRef.current = now

      const prev1 = lane1Ref.current
      const prev2 = lane2Ref.current
      const next1 = decayLaneFx(tickActive(prev1, dt))
      const next2 = decayLaneFx(tickActive(prev2, dt))
      lane1Ref.current = next1
      lane2Ref.current = next2

      syncTickRef.current += 1
      const needsUi =
        next1.falling !== prev1.falling ||
        next2.falling !== prev2.falling ||
        syncTickRef.current % 2 === 0
      if (needsUi) {
        startTransition(() => {
          setLane1(next1)
          setLane2(next2)
        })
      }

      if (!roundEndingRef.current) {
        roundTimeRef.current = Math.max(0, roundTimeRef.current - TICK_MS / 1000)
        if (syncTickRef.current % 4 === 0) {
          startTransition(() => setRoundTimeLeft(Math.ceil(roundTimeRef.current)))
        }
        if (roundTimeRef.current <= 0) endRound()
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [documentVisible, endRound])

  useEffect(() => {
    scheduleBot()
    return () => {
      clearTimerRef(botTimerRef)
      clearBotCommitTimer()
      clearTimerRef(popTimerRef)
      duelTimers.clearAll()
    }
  }, [clearBotCommitTimer, clearTimerRef, duelTimers, scheduleBot])

  const movePlayer = useCallback((dir: -1 | 1) => {
    if (!runningRef.current || roundEndingRef.current) return
    if (roundBreakUntilRef.current && performance.now() < roundBreakUntilRef.current) return
    if (lane1Ref.current.falling) return
    playStackDuelSound('move')
    setLane1((l) => {
      const next = nudgeActive(l, dir * 0.07)
      lane1Ref.current = next
      return next
    })
  }, [])

  const dropPlayer = useCallback(() => {
    if (!startDropP1()) return
    playStackDuelSound('drop')
  }, [startDropP1])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current || roundEndingRef.current) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        movePlayer(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        movePlayer(1)
      } else if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        dropPlayer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dropPlayer, movePlayer])

  const restartMatch = useCallback(() => {
    breakTimer.clear()
    clearBotCommitTimer()
    clearTimerRef(botTimerRef)
    endedRef.current = false
    roundEndingRef.current = false
    roundBreakUntilRef.current = 0
    roundNumberRef.current = 1
    roundSeedRef.current = 42 + Math.floor(Math.random() * 1000)
    roundTimeRef.current = ROUND_SECONDS
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    setMatchPoints({ p1: 0, p2: 0 })
    setWinner(null)
    setRoundMessage(null)
    setRoundScoreSummary(null)
    setIsRoundBreak(false)
    setRunning(true)
    const l1 = createLane(1, roundSeedRef.current)
    const l2 = createLane(2, roundSeedRef.current)
    lane1Ref.current = l1
    lane2Ref.current = l2
    setLane1(l1)
    setLane2(l2)
    scheduleBot()
  }, [breakTimer, clearBotCommitTimer, scheduleBot])

  return {
    lane1,
    lane2,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    roundScoreSummary,
    isRoundBreak,
    running,
    winner,
    matchPoints,
    targetScore: TARGET_SCORE,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    movePlayer,
    dropPlayer,
    commitDropP1,
    restartMatch,
  }
}
