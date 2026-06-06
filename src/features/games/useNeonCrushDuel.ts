import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkDelayMs, pickBotSwap } from './utils/neonCrushBot'
import { recordNeonCrushScore } from './utils/neonCrushLeaderboard'
import {
  comboMultiplier,
  computeSpawnIndices,
  createBoard,
  createLane,
  duelLeader,
  DUEL_SECONDS,
  FINAL_RUSH_SCORE_MULT,
  FINAL_RUSH_SECONDS,
  injectOpponentPressure,
  normalizeBoard,
  MATCH_ANIM_MS,
  pressureFromPlayerHit,
  pressureLabel,
  PRESSURE_COOLDOWN_MS,
  resolveRoundWinner,
  scoreRacePercents,
  SETTLE_ANIM_MS,
  trySwap,
  type NeonLaneFx,
  type NeonLaneState,
  type PressureIntensity,
} from './utils/neonCrushEngine'
import { playNeonCrushSound } from './utils/neonCrushSounds'

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

function applyLaneScore(lane: NeonLaneState, gain: number, combo: number): NeonLaneState {
  const roundScore = lane.roundScore + gain
  return {
    ...lane,
    score: lane.score + gain,
    roundScore,
    combo,
    comboMult: comboMultiplier(combo),
    fx: null,
  }
}

export function useNeonCrushDuel() {
  const [lane1, setLane1] = useState<NeonLaneState>(() => {
    const lane = createLane(1, 501)
    return { ...lane, cells: normalizeBoard(lane.cells) }
  })
  const [lane2, setLane2] = useState<NeonLaneState>(() => {
    const lane = createLane(2, 709)
    return { ...lane, cells: normalizeBoard(lane.cells) }
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(DUEL_SECONDS)
  const [matchMessage, setMatchMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [boardKey, setBoardKey] = useState(0)
  const [pressureToast, setPressureToast] = useState<string | null>(null)

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const timeRef = useRef(DUEL_SECONDS)
  const matchEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(501)
  const botTimerRef = useRef<number | null>(null)
  const p1AnimTimerRef = useRef<number | null>(null)
  const p2AnimTimerRef = useRef<number | null>(null)
  const scheduleBotRef = useRef<() => void>(() => {})
  const lastPressureAtRef = useRef(0)
  const pressureTimerRef = useRef<number | null>(null)

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const clearAnimTimers = useCallback(() => {
    if (p1AnimTimerRef.current != null) window.clearTimeout(p1AnimTimerRef.current)
    if (p2AnimTimerRef.current != null) window.clearTimeout(p2AnimTimerRef.current)
    p1AnimTimerRef.current = null
    p2AnimTimerRef.current = null
  }, [])

  const clearPressureTimer = useCallback(() => {
    if (pressureTimerRef.current != null) window.clearTimeout(pressureTimerRef.current)
    pressureTimerRef.current = null
  }, [])

  const applyOpponentPressure = useCallback(
    (intensity: PressureIntensity) => {
      if (endedRef.current || matchEndingRef.current) return
      const now = Date.now()
      if (now - lastPressureAtRef.current < PRESSURE_COOLDOWN_MS) return
      lastPressureAtRef.current = now

      const rand = mulberry32(seedRef.current++)
      const { board, indices } = injectOpponentPressure(lane2Ref.current.cells, intensity, rand)
      if (indices.length === 0) return

      const label = pressureLabel(intensity)
      const pressured: NeonLaneState = {
        ...lane2Ref.current,
        cells: board,
        pressure: { indices, tick: now, label },
        settle: { indices, tick: now },
      }
      lane2Ref.current = pressured
      setLane2(pressured)
      setPressureToast(label)
      playNeonCrushSound('pressure')
      setBoardKey((k) => k + 1)

      clearPressureTimer()
      pressureTimerRef.current = window.setTimeout(() => {
        setPressureToast(null)
        const cleared = { ...lane2Ref.current, pressure: null, settle: null }
        lane2Ref.current = cleared
        setLane2(cleared)
        pressureTimerRef.current = null
      }, 900)
    },
    [clearPressureTimer],
  )

  const bumpBoards = useCallback((seedBump: number) => {
    seedRef.current += seedBump
    const b1 = createBoard(seedRef.current + 3)
    const b2 = createBoard(seedRef.current + 17)
    setLane1((l) => ({ ...l, cells: b1, combo: 0, comboMult: 1, fx: null, settle: null, pressure: null }))
    setLane2((l) => ({ ...l, cells: b2, combo: 0, comboMult: 1, fx: null, settle: null, pressure: null }))
    lane1Ref.current = { ...lane1Ref.current, cells: b1, combo: 0, comboMult: 1, fx: null, settle: null, pressure: null }
    lane2Ref.current = { ...lane2Ref.current, cells: b2, combo: 0, comboMult: 1, fx: null, settle: null, pressure: null }
    setBoardKey((k) => k + 1)
  }, [])

  const commitLaneSwap = useCallback(
    (
      lane: 1 | 2,
      preview: NeonLaneState,
      finalBoard: NeonLaneState['cells'],
      fx: NeonLaneFx,
      scoreGain: number,
      combo: number,
    ) => {
      const timerRef = lane === 1 ? p1AnimTimerRef : p2AnimTimerRef
      if (timerRef.current != null) window.clearTimeout(timerRef.current)

      const withFx = { ...preview, fx }
      if (lane === 1) {
        lane1Ref.current = withFx
        setLane1(withFx)
      } else {
        lane2Ref.current = withFx
        setLane2(withFx)
      }

      timerRef.current = window.setTimeout(() => {
        const previewCells = (lane === 1 ? lane1Ref.current : lane2Ref.current).cells
        const rushMult =
          lane === 1 &&
          timeRef.current > 0 &&
          timeRef.current <= FINAL_RUSH_SECONDS
            ? FINAL_RUSH_SCORE_MULT
            : 1
        const adjustedGain = Math.round(scoreGain * rushMult)
        const next = applyLaneScore(
          {
            ...(lane === 1 ? lane1Ref.current : lane2Ref.current),
            cells: normalizeBoard(finalBoard),
          },
          adjustedGain,
          combo,
        )
        const spawnIndices = computeSpawnIndices(previewCells, finalBoard)
        const withSettle =
          spawnIndices.length > 0
            ? { ...next, settle: { indices: spawnIndices, tick: Date.now() } }
            : next
        if (spawnIndices.length > 0) playNeonCrushSound('fall')
        if (lane === 1) {
          lane1Ref.current = withSettle
          setLane1(withSettle)
        } else {
          lane2Ref.current = withSettle
          setLane2(withSettle)
        }
        setBoardKey((k) => k + 1)
        timerRef.current = null

        if (spawnIndices.length > 0) {
          window.setTimeout(() => {
            const clearSettle = (l: NeonLaneState) => ({ ...l, settle: null })
            if (lane === 1) {
              lane1Ref.current = clearSettle(lane1Ref.current)
              setLane1(lane1Ref.current)
            } else {
              lane2Ref.current = clearSettle(lane2Ref.current)
              setLane2(lane2Ref.current)
            }
          }, SETTLE_ANIM_MS)
        }

        if (lane === 1) {
          const hit = pressureFromPlayerHit(
            adjustedGain,
            combo,
            fx.burst,
            fx.specialActivate,
          )
          if (hit) applyOpponentPressure(hit)
        }
      }, MATCH_ANIM_MS)
    },
    [applyOpponentPressure],
  )

  const endMatchRef = useRef<() => void>(() => {})

  const endMatch = useCallback(() => {
    if (matchEndingRef.current || endedRef.current) return
    matchEndingRef.current = true
    clearBot()
    clearAnimTimers()
    setSelected(null)

    const rw = resolveRoundWinner(lane1Ref.current, lane2Ref.current)
    setWinner(rw)
    setRunning(false)
    endedRef.current = true
    setMatchMessage(null)
    recordNeonCrushScore(lane1Ref.current.roundScore)
    playNeonCrushSound(rw === 'p1' ? 'win' : rw === 'p2' ? 'lose' : 'round')
  }, [clearAnimTimers, clearBot])

  endMatchRef.current = endMatch

  const scheduleBot = useCallback(() => {
    clearBot()
    if (endedRef.current || matchEndingRef.current) return
    const delay = botThinkDelayMs(lane2Ref.current.combo)
    botTimerRef.current = window.setTimeout(() => {
      if (endedRef.current || matchEndingRef.current) return
      const [a, b] = pickBotSwap(lane2Ref.current.cells, seedRef.current)
      if (a < 0) {
        scheduleBotRef.current()
        return
      }
      const rand = mulberry32(seedRef.current++)
      const result = trySwap(lane2Ref.current.cells, a, b, rand)
      if (!result.ok) {
        bumpBoards(2)
        scheduleBotRef.current()
        return
      }
      if (result.specialActivate?.kind === 'prism') playNeonCrushSound('prism')
      else if (result.specialActivate) playNeonCrushSound('special')
      else if (result.burst?.tier === 5) playNeonCrushSound('mega')
      else if (result.burst?.tier === 4) playNeonCrushSound('line4')
      else playNeonCrushSound(result.combo >= 3 ? 'combo' : 'match')
      if (result.specialSpawn) playNeonCrushSound('special')
      const fx: NeonLaneFx = {
        popIndices: result.popIndices,
        segments: result.segments,
        scoreGain: result.scoreGain,
        combo: result.combo,
        tick: Date.now(),
        swap: result.swap,
        burst: result.burst,
        specialSpawn: result.specialSpawn,
        specialActivate: result.specialActivate,
      }
      commitLaneSwap(
        2,
        { ...lane2Ref.current, cells: result.previewBoard },
        result.board,
        fx,
        result.scoreGain,
        result.combo,
      )
      window.setTimeout(() => scheduleBotRef.current(), MATCH_ANIM_MS + 40)
    }, delay)
  }, [bumpBoards, clearBot, commitLaneSwap])

  scheduleBotRef.current = scheduleBot

  useEffect(() => {
    scheduleBotRef.current()
    return () => {
      clearBot()
      clearAnimTimers()
      clearPressureTimer()
    }
  }, [clearAnimTimers, clearBot, clearPressureTimer])

  useEffect(() => {
    if (!running || endedRef.current) return
    const timer = window.setInterval(() => {
      if (matchEndingRef.current) return
      timeRef.current = Math.max(0, timeRef.current - 1)
      setTimeLeft(timeRef.current)
      if (timeRef.current === FINAL_RUSH_SECONDS) playNeonCrushSound('rush')
      if (timeRef.current === 0) endMatchRef.current()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const tapCell = useCallback(
    (index: number) => {
      if (!running || matchEndingRef.current || endedRef.current) return

      if (selected == null) {
        playNeonCrushSound('select')
        setSelected(index)
        return
      }
      if (selected === index) {
        setSelected(null)
        return
      }

      const rand = mulberry32(seedRef.current++)
      const result = trySwap(lane1Ref.current.cells, selected, index, rand)
      setSelected(null)
      if (!result.ok) {
        playNeonCrushSound('invalid')
        return
      }

      playNeonCrushSound('swap')
      if (result.specialActivate?.kind === 'prism') playNeonCrushSound('prism')
      else if (result.specialActivate) playNeonCrushSound('special')
      else if (result.burst?.tier === 5) playNeonCrushSound('mega')
      else if (result.burst?.tier === 4) playNeonCrushSound('line4')
      else playNeonCrushSound(result.combo >= 3 ? 'combo' : 'match')
      if (result.specialSpawn) playNeonCrushSound('special')
      const fx: NeonLaneFx = {
        popIndices: result.popIndices,
        segments: result.segments,
        scoreGain: result.scoreGain,
        combo: result.combo,
        tick: Date.now(),
        swap: result.swap,
        burst: result.burst,
        specialSpawn: result.specialSpawn,
        specialActivate: result.specialActivate,
      }
      commitLaneSwap(
        1,
        { ...lane1Ref.current, cells: result.previewBoard },
        result.board,
        fx,
        result.scoreGain,
        result.combo,
      )
    },
    [commitLaneSwap, running, selected],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    clearAnimTimers()
    clearPressureTimer()
    endedRef.current = false
    matchEndingRef.current = false
    seedRef.current = 501 + Math.floor(Math.random() * 800)
    const l1 = createLane(1, seedRef.current)
    const l2 = createLane(2, seedRef.current + 99)
    lane1Ref.current = { ...l1, cells: normalizeBoard(l1.cells) }
    lane2Ref.current = { ...l2, cells: normalizeBoard(l2.cells) }
    setLane1(lane1Ref.current)
    setLane2(lane2Ref.current)
    setTimeLeft(DUEL_SECONDS)
    timeRef.current = DUEL_SECONDS
    setMatchMessage(null)
    setWinner(null)
    setPressureToast(null)
    setRunning(true)
    setSelected(null)
    setBoardKey((k) => k + 1)
    scheduleBotRef.current()
  }, [clearAnimTimers, clearBot, clearPressureTimer])

  const leader = duelLeader(lane1.roundScore, lane2.roundScore)
  const scoreRace = scoreRacePercents(lane1.roundScore, lane2.roundScore)
  const isFinalRush = running && timeLeft > 0 && timeLeft <= FINAL_RUSH_SECONDS

  return {
    lane1,
    lane2,
    selected,
    timeLeft,
    duelSeconds: DUEL_SECONDS,
    matchMessage,
    running,
    winner,
    boardKey,
    leader,
    scoreRace,
    isFinalRush,
    pressureToast,
    tapCell,
    restartMatch,
  }
}
