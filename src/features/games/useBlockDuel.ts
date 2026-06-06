import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createBlockLane,
  getLaneView,
  hardDropLane,
  MATCH_ROUNDS,
  resolveRoundWinner,
  ROUND_SECONDS,
  tickLanePresentation,
  updateBlockLane,
  WIN_ROUNDS,
  type BlockInput,
  type BlockLaneEvent,
  type BlockLaneState,
  type BlockLaneView,
} from './utils/blockEngine'
import { createBlockBot, updateBlockBotLane, type BlockBotBrain } from './utils/blockBot'
import { playBlockSound } from './utils/blockSounds'

type MatchResult = 'p1' | 'p2' | 'draw'
type RoundWinner = 'p1' | 'p2' | 'draw'

function freshMatchSeed() {
  return Math.floor(Math.random() * 900_001) + 100_003
}

export function useBlockDuel() {
  const [matchSeed] = useState(() => freshMatchSeed())
  const [lane1, setLane1] = useState<BlockLaneState>(() => createBlockLane(matchSeed * 2 + 1, 1))
  const [lane2, setLane2] = useState<BlockLaneState>(() => createBlockLane(matchSeed * 2 + 2, 1))
  const [matchPoints, setMatchPoints] = useState({ p1: 0, p2: 0 })
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchResult | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [roundIntro, setRoundIntro] = useState(2.4)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const lane1ViewRef = useRef<BlockLaneView>(getLaneView(lane1))
  const lane2ViewRef = useRef<BlockLaneView>(getLaneView(lane2))
  const matchPointsRef = useRef(matchPoints)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const runningRef = useRef(running)
  const endedRef = useRef(false)
  const inputRef = useRef<BlockInput>({})
  const botRef = useRef<BlockBotBrain>(createBlockBot(0))
  const syncTickRef = useRef(0)
  const roundSeedRef = useRef(matchSeed)
  const dasRef = useRef({ left: false, right: false, down: false, leftAccum: 0, rightAccum: 0 })

  const roundIntroRef = useRef(2.4)
  const DAS_DELAY = 0.07
  const DAS_REPEAT = 0.022

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  matchPointsRef.current = matchPoints
  lane1ViewRef.current = getLaneView(lane1)
  lane2ViewRef.current = getLaneView(lane2)
  runningRef.current = running && !winner

  const syncLanes = useCallback((l1: BlockLaneState, l2: BlockLaneState, timeDisplay: number) => {
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(Math.ceil(timeDisplay))
    lane1ViewRef.current = getLaneView(l1)
    lane2ViewRef.current = getLaneView(l2)
  }, [])

  const playEvents = useCallback((events: BlockLaneEvent[], side: 'p1' | 'p2') => {
    for (const event of events) {
      if (event === 'move') playBlockSound('move')
      else if (event === 'rotate') playBlockSound('rotate')
      else if (event === 'drop') playBlockSound('drop')
      else if (event === 'lock') playBlockSound('lock')
      else if (event === 'fusion') {
        playBlockSound('fusion')
        if (side === 'p1') setShakeKey((k) => k + 1)
      } else if (event === 'combo') playBlockSound('combo')
      else if (event === 'nova') playBlockSound('nova')
      else if (event === 'gameover') playBlockSound('gameover')
    }
  }, [])

  const endMatch = useCallback((result: MatchResult) => {
    if (endedRef.current) return
    endedRef.current = true
    runningRef.current = false
    setRunning(false)
    setWinner(result)
    playBlockSound(result === 'p1' ? 'win' : result === 'p2' ? 'lose' : 'round')
  }, [])

  const beginNextRound = useCallback(() => {
      if (endedRef.current) return
      roundSeedRef.current += 1
      const seed = roundSeedRef.current
      roundNumberRef.current += 1
      const roundIdx = roundNumberRef.current
      const l1 = createBlockLane(seed * 2 + 1, roundIdx)
      const l2 = createBlockLane(seed * 2 + 2, roundIdx)
      lane1Ref.current = l1
      lane2Ref.current = l2
      roundTimeRef.current = ROUND_SECONDS
      roundEndingRef.current = false
      setRoundNumber(roundIdx)
      botRef.current = createBlockBot(performance.now() / 1000)
      roundIntroRef.current = 2.4
      setRoundIntro(2.4)
      syncLanes(l1, l2, ROUND_SECONDS)
      playBlockSound('round')
    },
    [syncLanes],
  )

  const finishRound = useCallback(
    (roundWinner: RoundWinner, l1: BlockLaneState, l2: BlockLaneState) => {
      let points = { ...matchPointsRef.current }

      if (roundWinner === 'p1') points.p1 += 1
      else if (roundWinner === 'p2') points.p2 += 1

      matchPointsRef.current = points
      setMatchPoints(points)

      if (points.p1 >= WIN_ROUNDS) {
        syncLanes(l1, l2, 0)
        endMatch('p1')
        return
      }
      if (points.p2 >= WIN_ROUNDS) {
        syncLanes(l1, l2, 0)
        endMatch('p2')
        return
      }

      if (roundNumberRef.current >= MATCH_ROUNDS) {
        const matchResult =
          points.p1 > points.p2 ? 'p1' : points.p2 > points.p1 ? 'p2' : resolveRoundByPoints(l1, l2)
        syncLanes(l1, l2, 0)
        endMatch(matchResult)
        return
      }

      beginNextRound()
    },
    [beginNextRound, endMatch, syncLanes],
  )

  const handleTimeUp = useCallback(
    (l1: BlockLaneState, l2: BlockLaneState) => {
      const result = resolveRoundWinner(l1, l2)
      finishRound(result, l1, l2)
    },
    [finishRound],
  )

  const handleKnockout = useCallback(
    (side: 'p1' | 'p2', l1: BlockLaneState, l2: BlockLaneState) => {
      const roundWinner: RoundWinner = side === 'p1' ? 'p2' : 'p1'
      finishRound(roundWinner, l1, l2)
    },
    [finishRound],
  )

  useEffect(() => {
    if (!running || winner) return

    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      if (!runningRef.current || endedRef.current) return

      const dt = Math.min((now - last) / 1000, 0.028)
      last = now
      const nowSec = now / 1000

      if (roundIntroRef.current > 0) {
        roundIntroRef.current = Math.max(0, roundIntroRef.current - dt)
        setRoundIntro(roundIntroRef.current)
        syncTickRef.current += 1
        lane1Ref.current = tickLanePresentation(lane1Ref.current, dt)
        lane2Ref.current = tickLanePresentation(lane2Ref.current, dt)
        if (syncTickRef.current % 3 === 0) {
          syncLanes(lane1Ref.current, lane2Ref.current, roundTimeRef.current)
        }
        raf = requestAnimationFrame(tick)
        return
      }

      roundTimeRef.current = Math.max(0, roundTimeRef.current - dt)

      const input: BlockInput = { ...inputRef.current }
      inputRef.current = {}

      const das = dasRef.current
      if (das.left) {
        das.leftAccum += dt
        if (das.leftAccum >= DAS_DELAY) {
          while (das.leftAccum >= DAS_DELAY) {
            das.leftAccum -= DAS_REPEAT
            input.left = true
          }
        }
      } else {
        das.leftAccum = 0
      }
      if (das.right) {
        das.rightAccum += dt
        if (das.rightAccum >= DAS_DELAY) {
          while (das.rightAccum >= DAS_DELAY) {
            das.rightAccum -= DAS_REPEAT
            input.right = true
          }
        }
      } else {
        das.rightAccum = 0
      }

      const r1 = updateBlockLane(lane1Ref.current, dt, input)
      playEvents(r1.events, 'p1')
      lane1Ref.current = r1.lane

      const r2 = updateBlockBotLane(lane2Ref.current, dt, nowSec, botRef.current)
      playEvents(r2.events, 'p2')
      lane2Ref.current = r2.lane

      if (!lane1Ref.current.alive) {
        handleKnockout('p1', lane1Ref.current, lane2Ref.current)
        return
      }
      if (!lane2Ref.current.alive) {
        handleKnockout('p2', lane1Ref.current, lane2Ref.current)
        return
      }

      syncTickRef.current += 1
      const forceUi =
        r1.events.length > 0 ||
        r2.events.length > 0 ||
        input.left ||
        input.right ||
        input.down ||
        input.rotate
      if (forceUi || syncTickRef.current % 4 === 0) {
        syncLanes(lane1Ref.current, lane2Ref.current, roundTimeRef.current)
      }

      if (roundTimeRef.current <= 0 && !roundEndingRef.current) {
        roundEndingRef.current = true
        handleTimeUp(lane1Ref.current, lane2Ref.current)
        return
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, winner, roundNumber, playEvents, handleKnockout, handleTimeUp, syncLanes])

  const pressLeft = useCallback(() => {
    inputRef.current.left = true
  }, [])

  const pressRight = useCallback(() => {
    inputRef.current.right = true
  }, [])

  const pressDown = useCallback(() => {
    inputRef.current.down = true
  }, [])

  const pressRotate = useCallback(() => {
    inputRef.current.rotate = true
  }, [])

  const setHoldLeft = useCallback((held: boolean) => {
    dasRef.current.left = held
    if (held) {
      inputRef.current.left = true
      dasRef.current.leftAccum = DAS_DELAY * 0.72
    } else {
      dasRef.current.leftAccum = 0
    }
  }, [])

  const setHoldRight = useCallback((held: boolean) => {
    dasRef.current.right = held
    if (held) {
      inputRef.current.right = true
      dasRef.current.rightAccum = DAS_DELAY * 0.72
    } else {
      dasRef.current.rightAccum = 0
    }
  }, [])

  const setHoldDown = useCallback((held: boolean) => {
    dasRef.current.down = held
    if (held) inputRef.current.down = true
  }, [])

  const hardDrop = useCallback(() => {
    if (!runningRef.current || endedRef.current) return
    const result = hardDropLane(lane1Ref.current)
    playEvents(result.events, 'p1')
    lane1Ref.current = result.lane
    if (!result.lane.alive) {
      handleKnockout('p1', result.lane, lane2Ref.current)
      return
    }
    syncLanes(result.lane, lane2Ref.current, roundTimeRef.current)
  }, [handleKnockout, playEvents, syncLanes])

  const restart = useCallback(() => {
    endedRef.current = false
    runningRef.current = true
    roundEndingRef.current = false
    roundNumberRef.current = 1
    const seed = freshMatchSeed()
    roundSeedRef.current = seed
    roundTimeRef.current = ROUND_SECONDS
    matchPointsRef.current = { p1: 0, p2: 0 }
    dasRef.current = { left: false, right: false, down: false, leftAccum: 0, rightAccum: 0 }
    const l1 = createBlockLane(seed * 2 + 1, 1)
    const l2 = createBlockLane(seed * 2 + 2, 1)
    lane1Ref.current = l1
    lane2Ref.current = l2
    botRef.current = createBlockBot(performance.now() / 1000)
    setMatchPoints({ p1: 0, p2: 0 })
    setRoundNumber(1)
    setRoundTimeLeft(ROUND_SECONDS)
    setWinner(null)
    setRunning(true)
    setShakeKey(0)
    roundIntroRef.current = 2.4
    setRoundIntro(2.4)
    syncLanes(l1, l2, ROUND_SECONDS)
  }, [syncLanes])

  const formatTime = `${String(Math.floor(roundTimeLeft / 60)).padStart(2, '0')}:${String(roundTimeLeft % 60).padStart(2, '0')}`

  return {
    lane1,
    lane2,
    lane1ViewRef,
    lane2ViewRef,
    matchPoints,
    roundNumber,
    formatTime,
    winRounds: WIN_ROUNDS,
    matchRounds: MATCH_ROUNDS,
    running: running && !winner && lane1.alive && roundIntro <= 0,
    roundIntro,
    winner,
    shakeKey,
    pressLeft,
    pressRight,
    pressDown,
    pressRotate,
    hardDrop,
    setHoldLeft,
    setHoldRight,
    setHoldDown,
    restart,
  }
}

function resolveRoundByPoints(l1: BlockLaneState, l2: BlockLaneState): MatchResult {
  const w = resolveRoundWinner(l1, l2)
  if (w === 'draw') return 'draw'
  return w
}
