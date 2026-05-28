import { useCallback, useEffect, useRef, useState } from 'react'
import { pickBotDirection } from './utils/snakeDuelBot'
import {
  createLane,
  MATCH_ROUNDS,
  queueDirection,
  respawnLane,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  TICK_MS,
  tickLane,
  WIN_ROUNDS,
  type Direction,
  type SnakeLaneState,
} from './utils/snakeDuelEngine'

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

export function useSnakeDuel() {
  const [lane1, setLane1] = useState<SnakeLaneState>(() => createLane(1, 301))
  const [lane2, setLane2] = useState<SnakeLaneState>(() => createLane(2, 509))
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
  const seedRef = useRef(301)

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true

    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }
    setLane1(l1)
    setLane2(l2)

    setRoundMessage(rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN')

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
      seedRef.current += 41
      const n1 = createLane(1, seedRef.current)
      const n2 = createLane(2, seedRef.current + 19)
      n1.matchPoints = l1.matchPoints
      n2.matchPoints = l2.matchPoints
      lane1Ref.current = n1
      lane2Ref.current = n2
      setLane1(n1)
      setLane2(n2)
      roundTimeRef.current = ROUND_SECONDS
      setRoundTimeLeft(ROUND_SECONDS)
      roundEndingRef.current = false
      setRoundMessage(null)
    }, ROUND_BREAK_MS)
  }, [])

  useEffect(() => {
    if (!running || endedRef.current || roundMessage) return

    const loop = window.setInterval(() => {
      if (roundEndingRef.current || performance.now() < roundBreakUntilRef.current) return

      seedRef.current += 1
      const rand = mulberry32(seedRef.current)

      let l1 = lane1Ref.current
      let l2 = lane2Ref.current

      const botDir = pickBotDirection(l2)
      l2 = queueDirection(l2, botDir)

      l1 = tickLane(l1, rand)
      l2 = tickLane(l2, rand)

      if (!l1.alive) {
        l1 = respawnLane(l1, seedRef.current + 7)
      }
      if (!l2.alive) {
        l2 = respawnLane(l2, seedRef.current + 13)
      }

      lane1Ref.current = l1
      lane2Ref.current = l2
      setLane1(l1)
      setLane2(l2)
    }, TICK_MS)

    return () => window.clearInterval(loop)
  }, [running, roundMessage])

  useEffect(() => {
    if (!running || endedRef.current || roundMessage) return
    const timer = window.setInterval(() => {
      if (roundEndingRef.current) return
      roundTimeRef.current = Math.max(0, roundTimeRef.current - 1)
      setRoundTimeLeft(roundTimeRef.current)
      if (roundTimeRef.current === 0) endRound()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endRound, running, roundMessage])

  const setDirection = useCallback((dir: Direction) => {
    if (!running || roundEndingRef.current || endedRef.current) return
    const next = queueDirection(lane1Ref.current, dir)
    lane1Ref.current = next
    setLane1(next)
  }, [running])

  const restartMatch = useCallback(() => {
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 301 + Math.floor(Math.random() * 400)
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
  }, [])

  return {
    lane1,
    lane2,
    roundNumber,
    roundTimeLeft,
    roundMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    setDirection,
    restartMatch,
  }
}
