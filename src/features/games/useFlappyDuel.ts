import { useCallback, useEffect, useRef, useState } from 'react'
import { botShouldFlap } from './utils/flappyDuelBot'
import {
  createLane,
  MATCH_ROUNDS,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  startNewRound,
  updateLane,
  WIN_ROUNDS,
  type FlappyLaneEvent,
  type FlappyLaneState,
} from './utils/flappyDuelEngine'
import { playFlappyDuelSound } from './utils/flappyDuelSounds'

type MatchResult = 'p1' | 'p2' | 'draw'

export function useFlappyDuel() {
  const seedRef = useRef(42)
  const [lane1, setLane1] = useState<FlappyLaneState>(() => createLane(1, 42))
  const [lane2, setLane2] = useState<FlappyLaneState>(() => createLane(2, 42))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [running, setRunning] = useState(true)
  const [paused, setPaused] = useState(false)
  const [winner, setWinner] = useState<MatchResult | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const roundBreakUntilRef = useRef(0)
  const endedRef = useRef(false)
  const runningRef = useRef(running)
  const pausedRef = useRef(paused)
  const flapP1Ref = useRef(false)
  const syncTickRef = useRef(0)

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  runningRef.current = running
  pausedRef.current = paused

  const playEvents = useCallback((events: FlappyLaneEvent[], side: 'p1' | 'p2') => {
    for (const e of events) {
      if (e === 'flap') playFlappyDuelSound('flap')
      if (e === 'score') playFlappyDuelSound('score')
      if (e === 'crash') playFlappyDuelSound('crash')
      if (e === 'die' && side === 'p1') playFlappyDuelSound('crash')
    }
  }, [])

  const syncUi = useCallback((l1: FlappyLaneState, l2: FlappyLaneState, time: number) => {
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(time)
  }, [])

  const endRoundRef = useRef<() => void>(() => {})

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true
    playFlappyDuelSound('round')

    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }
    syncUi(l1, l2, roundTimeRef.current)

    setRoundMessage(rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN')
    setIsRoundBreak(true)
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
        playFlappyDuelSound(final === 'p1' ? 'win' : 'lose')
        setRoundMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }

      roundNumberRef.current += 1
      setRoundNumber(roundNumberRef.current)
      seedRef.current += 23
      const reset = startNewRound(l1, l2, seedRef.current)
      lane1Ref.current = reset.lane1
      lane2Ref.current = reset.lane2
      roundTimeRef.current = ROUND_SECONDS
      roundEndingRef.current = false
      setIsRoundBreak(false)
      setRoundMessage(null)
      syncUi(reset.lane1, reset.lane2, ROUND_SECONDS)
    }, ROUND_BREAK_MS)
  }, [syncUi])

  endRoundRef.current = endRound

  const flapP1 = useCallback(() => {
    flapP1Ref.current = true
  }, [])

  const togglePause = useCallback(() => {
    setPaused((p) => {
      pausedRef.current = !p
      return !p
    })
  }, [])

  const quitMatch = useCallback(() => {
    setRunning(false)
    endedRef.current = true
    setWinner('p2')
    setRoundMessage('VAZGEÇİLDİ')
  }, [])

  useEffect(() => {
    if (!running || endedRef.current) return

    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      if (!runningRef.current || endedRef.current) {
        raf = requestAnimationFrame(tick)
        return
      }

      if (pausedRef.current || performance.now() < roundBreakUntilRef.current) {
        last = now
        raf = requestAnimationFrame(tick)
        return
      }

      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      const nowSec = now / 1000

      roundTimeRef.current = Math.max(0, roundTimeRef.current - dt)

      const flap = flapP1Ref.current
      flapP1Ref.current = false

      const r1 = updateLane(lane1Ref.current, dt, flap, seedRef.current)
      playEvents(r1.events, 'p1')

      const botFlap = botShouldFlap(lane2Ref.current, nowSec)
      const r2 = updateLane(lane2Ref.current, dt, botFlap, seedRef.current + 500)
      playEvents(r2.events, 'p2')

      lane1Ref.current = r1.lane
      lane2Ref.current = r2.lane

      syncTickRef.current += 1
      const force =
        flap ||
        botFlap ||
        r1.events.length > 0 ||
        r2.events.length > 0 ||
        syncTickRef.current % 3 === 0
      if (force) syncUi(r1.lane, r2.lane, Math.ceil(roundTimeRef.current))

      if (roundTimeRef.current <= 0 && !roundEndingRef.current) {
        endRoundRef.current()
        return
      }

      if (!r1.lane.alive && !r2.lane.alive && r1.lane.lives <= 0 && r2.lane.lives <= 0) {
        endRoundRef.current()
        return
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playEvents, running, syncUi])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        flapP1Ref.current = true
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const restartMatch = useCallback(() => {
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 42 + Math.floor(Math.random() * 500)
    setRoundNumber(1)
    roundTimeRef.current = ROUND_SECONDS
    const l1 = createLane(1, seedRef.current)
    const l2 = createLane(2, seedRef.current + 99)
    lane1Ref.current = l1
    lane2Ref.current = l2
    setWinner(null)
    setRoundMessage(null)
    setIsRoundBreak(false)
    setPaused(false)
    pausedRef.current = false
    setRunning(true)
    syncUi(l1, l2, ROUND_SECONDS)
  }, [syncUi])

  return {
    lane1,
    lane2,
    lane1Ref,
    lane2Ref,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    isRoundBreak,
    running,
    paused,
    winner,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    flapP1,
    togglePause,
    quitMatch,
    restartMatch,
  }
}
