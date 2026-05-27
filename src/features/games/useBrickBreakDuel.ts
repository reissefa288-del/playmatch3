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
  const runningRef = useRef(true)
  const waveSeedRef = useRef(3)
  const waveLockRef = useRef(false)
  const syncUiTickRef = useRef(0)
  const p1DirRef = useRef(p1Dir)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const lane1RenderRef = useRef(lane1)
  const lane2RenderRef = useRef(lane2)
  const timeLeftRef = useRef(timeLeft)
  const roundRef = useRef(round)

  if (!running) {
    lane1Ref.current = lane1
    lane2Ref.current = lane2
    lane1RenderRef.current = lane1
    lane2RenderRef.current = lane2
  }
  p1DirRef.current = p1Dir
  timeLeftRef.current = timeLeft
  roundRef.current = round
  runningRef.current = running

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

  const nextWave = useCallback((refillP1: boolean, refillP2: boolean) => {
    if (refillP1) {
      waveSeedRef.current += 1
      const next = refillLaneBricks(lane1Ref.current, waveSeedRef.current * 2 + 1)
      lane1Ref.current = next
      lane1RenderRef.current = next
      setLane1(next)
    }
    if (refillP2) {
      waveSeedRef.current += 1
      const next = refillLaneBricks(lane2Ref.current, waveSeedRef.current * 2 + 2)
      lane2Ref.current = next
      lane2RenderRef.current = next
      setLane2(next)
    }
    if (refillP1 || refillP2) {
      roundRef.current += 1
      setRound(roundRef.current)
    }
  }, [])

  const endMatch = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    runningRef.current = false
    const result =
      lane1Ref.current.lives <= 0 ? 'p2' : getMatchWinner(lane1Ref.current, lane2Ref.current)
    setWinner(result)
    setRunning(false)
    persistBest('p1', lane1Ref.current.score)
    persistBest('p2', lane2Ref.current.score)
    playBrickBreakSound('win')
  }, [persistBest])

  const syncHud = useCallback((l1: LaneState, l2: LaneState, timeDisplay: number) => {
    setLane1(l1)
    setLane2(l2)
    setTimeLeft(Math.ceil(timeDisplay))
  }, [])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      if (!runningRef.current || endedRef.current) return

      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      const speedMult = getSpeedMult()

      const prevLives1 = lane1Ref.current.lives
      const prevScore1 = lane1Ref.current.score
      const prevScore2 = lane2Ref.current.score

      const r1 = updateLane(lane1Ref.current, p1DirRef.current, dt, speedMult)
      playEvents(r1.events)
      lane1Ref.current = r1.lane
      lane1RenderRef.current = r1.lane

      if (r1.lane.lives <= 0) {
        endMatch()
      }

      const target = botPaddleTarget(lane2Ref.current)
      const delta = target - lane2Ref.current.paddleX
      const botDir: -1 | 0 | 1 = Math.abs(delta) < 0.006 ? 0 : delta > 0 ? 1 : -1
      const r2 = updateLane(lane2Ref.current, botDir, dt, speedMult)
      playEvents(r2.events)
      lane2Ref.current = r2.lane
      lane2RenderRef.current = r2.lane

      syncUiTickRef.current += 1
      const forceUi =
        r1.events.length > 0 ||
        r2.events.length > 0 ||
        r1.lane.lives !== prevLives1 ||
        r1.lane.score !== prevScore1 ||
        r2.lane.score !== prevScore2
      if (forceUi || syncUiTickRef.current % 4 === 0) {
        syncHud(r1.lane, r2.lane, timeLeftRef.current)
      }

      if (!waveLockRef.current) {
        const refillP1 = bricksRemaining(lane1Ref.current.bricks) === 0
        const refillP2 = bricksRemaining(lane2Ref.current.bricks) === 0
        if (refillP1 || refillP2) {
          waveLockRef.current = true
          window.setTimeout(() => {
            nextWave(refillP1, refillP2)
            waveLockRef.current = false
          }, 350)
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [endMatch, getSpeedMult, nextWave, playEvents, running, syncHud])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1)
      if (timeLeftRef.current <= 0) {
        endMatch()
        return
      }
      setTimeLeft(timeLeftRef.current)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endMatch, running])

  const setPlayerDirection = useCallback((dir: -1 | 0 | 1) => {
    unlockBrickBreakAudio()
    if (lane1Ref.current.lives <= 0) return
    p1DirRef.current = dir
    setP1Dir(dir)
  }, [])

  const restart = useCallback(() => {
    endedRef.current = false
    runningRef.current = true
    waveSeedRef.current = 3
    waveLockRef.current = false
    syncUiTickRef.current = 0
    p1DirRef.current = 0
    timeLeftRef.current = MATCH_SECONDS
    roundRef.current = 1

    const l1 = createLane(11)
    const l2 = createLane(12)
    lane1Ref.current = l1
    lane2Ref.current = l2
    lane1RenderRef.current = l1
    lane2RenderRef.current = l2

    setLane1(l1)
    setLane2(l2)
    setTimeLeft(MATCH_SECONDS)
    setRound(1)
    setP1Dir(0)
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
    lane1RenderRef,
    lane2RenderRef,
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
