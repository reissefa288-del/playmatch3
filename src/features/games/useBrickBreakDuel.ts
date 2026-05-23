import { useCallback, useEffect, useRef, useState } from 'react'
import {
  botPaddleTarget,
  bricksRemaining,
  computeSpeedMultiplier,
  createLane,
  getMatchWinner,
  MATCH_SECONDS,
  MAX_LIVES,
  refillLaneBricks,
  updateLane,
  type LaneState,
} from './utils/brickBreakEngine'
import { playBrickBreakSound, unlockBrickBreakAudio } from './utils/brickBreakSounds'

const BEST_P1_KEY = 'pm-brick-best-p1'
const BEST_P2_KEY = 'pm-brick-best-p2'

export function useBrickBreakDuel() {
  const [lane1, setLane1] = useState<LaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<LaneState>(() => createLane(2))
  const [best1, setBest1] = useState(() => Number(window.localStorage.getItem(BEST_P1_KEY) ?? 2430))
  const [best2, setBest2] = useState(() => Number(window.localStorage.getItem(BEST_P2_KEY) ?? 1980))
  const [timeLeft, setTimeLeft] = useState(MATCH_SECONDS)
  const [round, setRound] = useState(1)
  const [p1Dir, setP1Dir] = useState<-1 | 0 | 1>(0)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<'p1' | 'p2' | 'draw' | null>(null)
  const endedRef = useRef(false)
  const waveSeedRef = useRef(3)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const p1DirRef = useRef(p1Dir)
  const timeLeftRef = useRef(timeLeft)
  const roundRef = useRef(round)
  lane1Ref.current = lane1
  lane2Ref.current = lane2
  p1DirRef.current = p1Dir
  timeLeftRef.current = timeLeft
  roundRef.current = round

  const persistBest = useCallback((lane: 'p1' | 'p2', score: number) => {
    if (lane === 'p1') {
      setBest1((current) => {
        const next = Math.max(current, score)
        window.localStorage.setItem(BEST_P1_KEY, String(next))
        return next
      })
      return
    }
    setBest2((current) => {
      const next = Math.max(current, score)
      window.localStorage.setItem(BEST_P2_KEY, String(next))
      return next
    })
  }, [])

  const getSpeedMult = useCallback(() => {
    const bricksBroken = lane1Ref.current.bricksBroken + lane2Ref.current.bricksBroken
    return computeSpeedMultiplier({
      timeLeft: timeLeftRef.current,
      roundSeconds: MATCH_SECONDS,
      round: roundRef.current,
      bricksBroken,
    })
  }, [])

  const playEvents = useCallback((events: ReturnType<typeof updateLane>['events']) => {
    for (const event of events) {
      if (event === 'life') playBrickBreakSound('life')
      else if (event === 'powerup') playBrickBreakSound('powerup')
      else playBrickBreakSound(event)
    }
  }, [])

  const waveLockRef = useRef(false)

  const nextWave = useCallback((refillP1: boolean, refillP2: boolean) => {
    if (refillP1) {
      waveSeedRef.current += 1
      setLane1((current) => refillLaneBricks(current, waveSeedRef.current * 2 + 1))
    }
    if (refillP2) {
      waveSeedRef.current += 1
      setLane2((current) => refillLaneBricks(current, waveSeedRef.current * 2 + 2))
    }
    if (refillP1 || refillP2) setRound((current) => current + 1)
  }, [])

  const endMatch = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    const result =
      lane1Ref.current.lives <= 0 ? 'p2' : getMatchWinner(lane1Ref.current, lane2Ref.current)
    setWinner(result)
    setRunning(false)
    persistBest('p1', lane1Ref.current.score)
    persistBest('p2', lane2Ref.current.score)
    playBrickBreakSound('win')
  }, [persistBest])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      const speedMult = getSpeedMult()

      setLane1((current) => {
        const { lane: next, events } = updateLane(current, p1DirRef.current, dt, speedMult)
        playEvents(events)
        if (next.lives <= 0 && current.lives > 0) {
          window.setTimeout(() => endMatch(), 500)
        }
        return next
      })

      setLane2((current) => {
        const target = botPaddleTarget(current)
        const delta = target - current.paddleX
        const botDir: -1 | 0 | 1 = Math.abs(delta) < 0.006 ? 0 : delta > 0 ? 1 : -1
        const { lane: next, events } = updateLane(current, botDir, dt, speedMult)
        playEvents(events)
        return next
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [endMatch, getSpeedMult, playEvents, running])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          endMatch()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endMatch, running])

  useEffect(() => {
    if (!running || waveLockRef.current) return
    const refillP1 = bricksRemaining(lane1.bricks) === 0
    const refillP2 = bricksRemaining(lane2.bricks) === 0
    if (!refillP1 && !refillP2) return

    waveLockRef.current = true
    window.setTimeout(() => {
      nextWave(refillP1, refillP2)
      waveLockRef.current = false
    }, 350)
  }, [lane1.bricks, lane2.bricks, nextWave, running])

  const setPlayerDirection = useCallback((dir: -1 | 0 | 1) => {
    unlockBrickBreakAudio()
    if (lane1Ref.current.lives <= 0) return
    setP1Dir(dir)
  }, [])

  const restart = useCallback(() => {
    endedRef.current = false
    waveSeedRef.current = 3
    setLane1(createLane(11))
    setLane2(createLane(12))
    setTimeLeft(MATCH_SECONDS)
    setRound(1)
    setWinner(null)
    setRunning(true)
  }, [])

  const formatTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
  const speedMult = computeSpeedMultiplier({
    timeLeft,
    roundSeconds: MATCH_SECONDS,
    round,
    bricksBroken: lane1.bricksBroken + lane2.bricksBroken,
  })
  const speedLevel = Math.round((speedMult - 1) * 100)

  return {
    lane1,
    lane2,
    best1,
    best2,
    formatTime,
    round,
    winner,
    maxLives: MAX_LIVES,
    running,
    speedLevel,
    setPlayerDirection,
    restart,
  }
}
