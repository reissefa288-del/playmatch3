import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkDelayMs, botThrow } from './utils/dartDuelBot'
import type { DartFlight } from './components/DartBoard'
import {
  applyThrow,
  createLane,
  MATCH_LEGS,
  resetLaneLeg,
  resetLaneThrows,
  resolveLegWinner,
  throwFromAimPower,
  THROWS_PER_TURN,
  TURN_MS,
  WIN_LEGS,
  type DartLaneState,
  type DartThrow,
} from './utils/dartDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'
type ActivePlayer = 'p1' | 'p2'

const THROW_ANIM_MS = 520

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function flightForThrow(tap: DartThrow): DartFlight {
  return {
    fromX: 0.5,
    fromY: 1.08,
    toX: tap.x,
    toY: tap.y,
    active: true,
  }
}

export function useDartDuel() {
  const [lane1, setLane1] = useState<DartLaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<DartLaneState>(() => createLane(2))
  const [legNumber, setLegNumber] = useState(1)
  const [activePlayer, setActivePlayer] = useState<ActivePlayer>('p1')
  const [throwsLeft, setThrowsLeft] = useState(THROWS_PER_TURN)
  const [turnTimeLeft, setTurnTimeLeft] = useState(Math.ceil(TURN_MS / 1000))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [lastHit, setLastHit] = useState<DartThrow | null>(null)
  const [p2LastHit, setP2LastHit] = useState<DartThrow | null>(null)
  const [isThrowing, setIsThrowing] = useState(false)
  const [p1Flight, setP1Flight] = useState<DartFlight | null>(null)
  const [p2Flight, setP2Flight] = useState<DartFlight | null>(null)
  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const activeRef = useRef<ActivePlayer>('p1')
  const throwsLeftRef = useRef(THROWS_PER_TURN)
  const legRef = useRef(1)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const throwingRef = useRef(false)
  const seedRef = useRef(811)
  const botTimerRef = useRef<number | null>(null)
  const turnEndRef = useRef(0)

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  activeRef.current = activePlayer
  throwsLeftRef.current = throwsLeft
  throwingRef.current = isThrowing

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const startTurnTimer = useCallback(() => {
    turnEndRef.current = performance.now() + TURN_MS
    setTurnTimeLeft(Math.ceil(TURN_MS / 1000))
  }, [])

  const switchPlayer = useCallback(
    (next: ActivePlayer) => {
      activeRef.current = next
      setActivePlayer(next)
      throwsLeftRef.current = THROWS_PER_TURN
      setThrowsLeft(THROWS_PER_TURN)
      if (next === 'p1') {
        setLane1((l) => resetLaneThrows(l))
        setLastHit(null)
      } else {
        setLane2((l) => resetLaneThrows(l))
        setP2LastHit(null)
      }
      startTurnTimer()
    },
    [startTurnTimer],
  )

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    clearBot()

    const rw = resolveLegWinner(lane1Ref.current, lane2Ref.current)
    let l1 = lane1Ref.current
    let l2 = lane2Ref.current
    if (rw === 'p1') l1 = { ...l1, legPoints: l1.legPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, legPoints: l2.legPoints + 1 }
    setLane1(l1)
    setLane2(l2)

    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : 'LEG KAYBETTİN')

    const matchOver = l1.legPoints >= WIN_LEGS || l2.legPoints >= WIN_LEGS || legRef.current >= MATCH_LEGS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.legPoints > l2.legPoints ? 'p1' : l2.legPoints > l1.legPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      legRef.current += 1
      setLegNumber(legRef.current)
      const n1 = resetLaneLeg(l1, true)
      const n2 = resetLaneLeg(l2, true)
      lane1Ref.current = n1
      lane2Ref.current = n2
      setLane1(n1)
      setLane2(n2)
      legEndingRef.current = false
      setLegMessage(null)
      switchPlayer('p1')
    }, 2200)
  }, [clearBot, switchPlayer])

  const afterThrow = useCallback(
    (player: ActivePlayer, lane: DartLaneState) => {
      if (lane.remaining === 0) {
        endLeg()
        return
      }
      const left = throwsLeftRef.current - 1
      throwsLeftRef.current = left
      setThrowsLeft(left)
      if (left <= 0) {
        const next: ActivePlayer = player === 'p1' ? 'p2' : 'p1'
        switchPlayer(next)
        return
      }
      startTurnTimer()
    },
    [endLeg, startTurnTimer, switchPlayer],
  )

  const animateThrow = useCallback(
    (
      player: ActivePlayer,
      tap: DartThrow,
      onDone: (lane: DartLaneState) => void,
    ) => {
      const flight = flightForThrow(tap)
      throwingRef.current = true
      setIsThrowing(true)

      if (player === 'p1') {
        setP1Flight(flight)
      } else {
        setP2Flight(flight)
      }

      window.setTimeout(() => {
        if (player === 'p1') {
          setP1Flight(null)
          setLastHit(tap)
        } else {
          setP2Flight(null)
          setP2LastHit(tap)
        }

        const lane = player === 'p1' ? lane1Ref.current : lane2Ref.current
        const next = applyThrow(lane, tap)
        if (player === 'p1') {
          lane1Ref.current = next
          setLane1(next)
        } else {
          lane2Ref.current = next
          setLane2(next)
        }

        throwingRef.current = false
        setIsThrowing(false)
        onDone(next)
      }, THROW_ANIM_MS)
    },
    [],
  )

  const runBotTurn = useCallback(() => {
    if (endedRef.current || legEndingRef.current || activeRef.current !== 'p2' || throwingRef.current) {
      return
    }

    const throwOnce = () => {
      if (endedRef.current || legEndingRef.current || activeRef.current !== 'p2' || throwingRef.current) {
        return
      }
      if (throwsLeftRef.current <= 0) return

      seedRef.current += 1
      const hit = botThrow(seedRef.current, lane2Ref.current.remaining)

      animateThrow('p2', hit, (next) => {
        if (next.remaining === 0) {
          endLeg()
          return
        }
        throwsLeftRef.current -= 1
        setThrowsLeft(throwsLeftRef.current)
        if (throwsLeftRef.current <= 0) {
          switchPlayer('p1')
          return
        }
        botTimerRef.current = window.setTimeout(throwOnce, botThinkDelayMs())
      })
    }

    botTimerRef.current = window.setTimeout(throwOnce, botThinkDelayMs())
  }, [animateThrow, endLeg, switchPlayer])

  useEffect(() => {
    if (activePlayer === 'p2' && running && !legMessage && !endedRef.current && !isThrowing) {
      runBotTurn()
    } else if (activePlayer !== 'p2') {
      clearBot()
    }
    return () => clearBot()
  }, [activePlayer, running, legMessage, isThrowing, runBotTurn, clearBot])

  useEffect(() => {
    if (!running || endedRef.current || legMessage) return
    const tick = window.setInterval(() => {
      if (legEndingRef.current || throwingRef.current) return
      const left = Math.max(0, Math.ceil((turnEndRef.current - performance.now()) / 1000))
      setTurnTimeLeft(left)
      if (left === 0 && activeRef.current === 'p1') {
        switchPlayer('p2')
      }
    }, 250)
    return () => window.clearInterval(tick)
  }, [running, legMessage, switchPlayer])

  useEffect(() => {
    startTurnTimer()
  }, [startTurnTimer])

  const throwP1 = useCallback(
    (aimX: number, power: number) => {
      if (!running || legEndingRef.current || endedRef.current || throwingRef.current) return
      if (activeRef.current !== 'p1' || throwsLeftRef.current <= 0) return

      const rand = mulberry32(seedRef.current++)
      const tap = throwFromAimPower(aimX, power, rand)

      animateThrow('p1', tap, (next) => {
        afterThrow('p1', next)
      })
    },
    [afterThrow, animateThrow, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    throwingRef.current = false
    legRef.current = 1
    seedRef.current = 811 + Math.floor(Math.random() * 400)
    const l1 = createLane(1)
    const l2 = createLane(2)
    lane1Ref.current = l1
    lane2Ref.current = l2
    setLane1(l1)
    setLane2(l2)
    setLegNumber(1)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
    setLastHit(null)
    setP2LastHit(null)
    setP1Flight(null)
    setP2Flight(null)
    setIsThrowing(false)
    switchPlayer('p1')
  }, [clearBot, switchPlayer])

  return {
    lane1,
    lane2,
    legNumber,
    matchLegs: MATCH_LEGS,
    activePlayer,
    throwsLeft,
    turnTimeLeft,
    legMessage,
    running,
    winner,
    lastHit,
    p2LastHit,
    isThrowing,
    p1Flight,
    p2Flight,
    throwP1,
    restartMatch,
  }
}
