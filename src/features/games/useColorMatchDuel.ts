import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkDelayMs, pickBotTapIndex } from './utils/colorMatchBot'
import {
  applyHit,
  buildGrid,
  COLOR_IDS,
  createLane,
  MATCH_ROUNDS,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  TARGET_TIMEOUT_MS,
  WIN_ROUNDS,
  type ColorId,
  type ColorLaneState,
} from './utils/colorMatchEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

function pickTarget(seed: number): ColorId {
  return COLOR_IDS[seed % COLOR_IDS.length]!
}

export function useColorMatchDuel() {
  const [lane1, setLane1] = useState<ColorLaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<ColorLaneState>(() => createLane(2))
  const [target, setTarget] = useState<ColorId>('cyan')
  const [targetKey, setTargetKey] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const targetRef = useRef(target)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const seedRef = useRef(401)
  const botTimerRef = useRef<number | null>(null)
  const targetTimerRef = useRef<number | null>(null)
  const scheduleBotRef = useRef<() => void>(() => {})

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  targetRef.current = target

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const clearTargetTimer = useCallback(() => {
    if (targetTimerRef.current != null) window.clearTimeout(targetTimerRef.current)
    targetTimerRef.current = null
  }, [])

  const spawnTarget = useCallback((seedBump = 1) => {
    seedRef.current += seedBump
    const nextTarget = pickTarget(seedRef.current)
    targetRef.current = nextTarget
    setTarget(nextTarget)
    setTargetKey((k) => k + 1)

    const g1 = buildGrid(seedRef.current + 11, nextTarget)
    const g2 = buildGrid(seedRef.current + 29, nextTarget)
    setLane1((l) => ({ ...l, cells: g1, lastFx: null }))
    setLane2((l) => ({ ...l, cells: g2, lastFx: null }))
    lane1Ref.current = { ...lane1Ref.current, cells: g1, lastFx: null }
    lane2Ref.current = { ...lane2Ref.current, cells: g2, lastFx: null }
  }, [])

  const scheduleTargetTimeout = useCallback(() => {
    clearTargetTimer()
    targetTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || roundEndingRef.current) return
      setLane1((l) => ({ ...l, combo: 0, comboMult: 1, lastFx: 'miss' }))
      setLane2((l) => ({ ...l, combo: 0, comboMult: 1, lastFx: null }))
      spawnTarget(3)
      scheduleBotRef.current()
    }, TARGET_TIMEOUT_MS)
  }, [clearTargetTimer, spawnTarget])

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || roundEndingRef.current) return
    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || roundEndingRef.current) return
      const idx = pickBotTapIndex(lane2Ref.current, targetRef.current, seedRef.current)
      const next = applyHit(lane2Ref.current, idx, targetRef.current)
      lane2Ref.current = next
      setLane2(next)
      if (next.lastFx === 'hit') {
        spawnTarget(2)
        scheduleTargetTimeout()
      }
      scheduleBotRef.current()
    }, delay)
  }, [clearBot, spawnTarget, scheduleTargetTimeout])

  scheduleBotRef.current = scheduleBot

  const afterHit = useCallback(() => {
    spawnTarget(2)
    scheduleTargetTimeout()
    scheduleBotRef.current()
  }, [spawnTarget, scheduleTargetTimeout])

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    clearBot()
    clearTargetTimer()

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
      const reset1 = createLane(1)
      const reset2 = createLane(2)
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
      spawnTarget(5)
      scheduleTargetTimeout()
      scheduleBotRef.current()
    }, ROUND_BREAK_MS)
  }, [clearBot, clearTargetTimer, spawnTarget, scheduleTargetTimeout])

  useEffect(() => {
    spawnTarget(0)
    scheduleTargetTimeout()
    scheduleBotRef.current()
    return () => {
      clearBot()
      clearTargetTimer()
    }
  }, [clearBot, clearTargetTimer, scheduleTargetTimeout, spawnTarget])

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
      const next = applyHit(lane1Ref.current, index, targetRef.current)
      lane1Ref.current = next
      setLane1(next)
      if (next.lastFx === 'hit') afterHit()
    },
    [afterHit, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    clearTargetTimer()
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 401 + Math.floor(Math.random() * 500)
    const l1 = createLane(1)
    const l2 = createLane(2)
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
    spawnTarget(1)
    scheduleTargetTimeout()
    scheduleBotRef.current()
  }, [clearBot, clearTargetTimer, scheduleTargetTimeout, spawnTarget])

  return {
    lane1,
    lane2,
    target,
    targetKey,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    tapP1,
    restartMatch,
  }
}
