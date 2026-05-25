import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createLane,
  resolveRoundByScore,
  ROUND_SECONDS,
  startNewRound,
  updateLane,
  WIN_POINTS,
  type LaneEvent,
  type LaneState,
} from './utils/bubbleShooterEngine'
import { botFireDelay, getBotDecision, smoothBotAim } from './utils/bubbleShooterBot'
import { playBubbleSound } from './utils/bubbleShooterSounds'

type MatchResult = 'p1' | 'p2' | 'draw'
type RoundWinner = 'p1' | 'p2' | 'draw'
export type ShootTurn = 'p1' | 'p2'

function updateBotLane(
  lane: LaneState,
  dt: number,
  nowSec: number,
  bot: BotBrain,
  canShoot: boolean,
): { lane: LaneState; events: LaneEvent[] } {
  const events: LaneEvent[] = []

  if (nowSec >= bot.thinkAt) {
    const decision = getBotDecision(lane)
    bot.targetAngle = decision.targetAngle
    bot.quality = decision.quality
    bot.pendingSwap = decision.shouldSwap
    bot.thinkAt = nowSec + 0.32 + Math.random() * 0.15
  }

  const nextAngle = smoothBotAim(lane.aimAngle, bot.targetAngle, dt, bot.quality)
  const working: LaneState = { ...lane, aimAngle: nextAngle }
  const aligned = Math.abs(bot.targetAngle - nextAngle) < 0.08

  if (bot.pendingSwap && working.canShoot && !working.projectile) {
    bot.pendingSwap = false
    const swapped = updateLane(working, 0, dt, false, true)
    events.push(...swapped.events)
    bot.fireAt = nowSec + botFireDelay(bot.quality) * 0.5
    return { lane: swapped.lane, events }
  }

  const shouldFire =
    canShoot && nowSec >= bot.fireAt && aligned && working.canShoot && !working.projectile
  if (shouldFire) bot.fireAt = nowSec + botFireDelay(bot.quality)

  const result = updateLane(working, 0, dt, shouldFire, false)
  events.push(...result.events)
  return { lane: result.lane, events }
}

type BotBrain = {
  targetAngle: number
  quality: number
  fireAt: number
  thinkAt: number
  pendingSwap: boolean
}

function createBotBrain(nowSec: number): BotBrain {
  return {
    targetAngle: -Math.PI / 2,
    quality: 0,
    fireAt: nowSec + 1.1,
    thinkAt: 0,
    pendingSwap: false,
  }
}

export function useBubbleShooterDuel() {
  const [lane1, setLane1] = useState<LaneState>(() => createLane(1))
  const [lane2, setLane2] = useState<LaneState>(() => createLane(2))
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [isRoundBreak, setIsRoundBreak] = useState(false)
  const [isOvertime, setIsOvertime] = useState(false)
  const [aimDir, setAimDir] = useState<-1 | 0 | 1>(0)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchResult | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [activeTurn, setActiveTurn] = useState<ShootTurn>('p1')

  const syncUiTickRef = useRef(0)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundBreakUntilRef = useRef(0)
  const roundSeedRef = useRef(3)
  const roundNumberRef = useRef(1)
  const isOvertimeRef = useRef(false)
  const roundEndingRef = useRef(false)
  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const lane1RenderRef = useRef(lane1)
  const lane2RenderRef = useRef(lane2)
  const aimDirRef = useRef(aimDir)
  const runningRef = useRef(running)
  const endedRef = useRef(false)
  const fireRef = useRef(false)
  const swapRef = useRef(false)
  const botRef = useRef<BotBrain>(createBotBrain(0))
  const activeTurnRef = useRef<ShootTurn>('p1')

  lane1Ref.current = lane1
  lane2Ref.current = lane2
  lane1RenderRef.current = lane1
  lane2RenderRef.current = lane2
  aimDirRef.current = aimDir
  runningRef.current = running

  const syncLanesToReact = useCallback((l1: LaneState, l2: LaneState, timeDisplay: number) => {
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(Math.ceil(timeDisplay))
  }, [])

  const playEvents = useCallback((events: LaneEvent[], side: 'p1' | 'p2') => {
    for (const event of events) {
      if (event === 'swap') playBubbleSound('swap')
      else if (event === 'shoot') playBubbleSound('shoot')
      else if (event === 'pop' || event === 'drop') playBubbleSound('pop')
      else if (event === 'combo') playBubbleSound('point')
      else if (event === 'clear') playBubbleSound('win')
      else if (event === 'burst') {
        playBubbleSound('pop')
        if (side === 'p1') setShakeKey((k) => k + 1)
      }
    }
  }, [])

  const endMatch = useCallback((result: MatchResult) => {
    if (endedRef.current) return
    endedRef.current = true
    runningRef.current = false
    setRunning(false)
    setIsRoundBreak(false)
    setWinner(result)
    playBubbleSound(result === 'p1' ? 'win' : result === 'p2' ? 'lose' : 'point')
  }, [])

  const beginNextRound = useCallback(
    (l1: LaneState, l2: LaneState) => {
      if (endedRef.current) return
      roundSeedRef.current += 1
      roundNumberRef.current += 1
      const seed = roundSeedRef.current
      const next1 = startNewRound(l1, seed * 2 + 1)
      const next2 = startNewRound(l2, seed * 2 + 2)
      lane1Ref.current = next1
      lane2Ref.current = next2
      lane1RenderRef.current = next1
      lane2RenderRef.current = next2
      roundTimeRef.current = ROUND_SECONDS
      roundEndingRef.current = false
      isOvertimeRef.current = false
      setIsOvertime(false)
      setRoundNumber(roundNumberRef.current)
      setRoundMessage(null)
      setIsRoundBreak(false)
      syncLanesToReact(next1, next2, ROUND_SECONDS)
      botRef.current = createBotBrain(performance.now() / 1000)
      activeTurnRef.current = 'p1'
      setActiveTurn('p1')
    },
    [syncLanesToReact],
  )

  const finishRound = useCallback(
    (roundWinner: RoundWinner, l1: LaneState, l2: LaneState) => {
      let next1 = { ...l1 }
      let next2 = { ...l2 }

      if (roundWinner === 'p1') {
        next1 = { ...next1, matchPoints: next1.matchPoints + 1 }
      } else if (roundWinner === 'p2') {
        next2 = { ...next2, matchPoints: next2.matchPoints + 1 }
      }

      lane1Ref.current = next1
      lane2Ref.current = next2

      if (roundNumberRef.current >= WIN_POINTS) {
        const matchResult =
          next1.matchPoints > next2.matchPoints
            ? 'p1'
            : next2.matchPoints > next1.matchPoints
              ? 'p2'
              : next1.totalScore > next2.totalScore
                ? 'p1'
                : next2.totalScore > next1.totalScore
                  ? 'p2'
                  : 'draw'
        syncLanesToReact(next1, next2, 0)
        endMatch(matchResult)
        return
      }

      playBubbleSound(roundWinner === 'draw' ? 'point' : 'round')
      syncLanesToReact(next1, next2, ROUND_SECONDS)
      beginNextRound(next1, next2)
    },
    [beginNextRound, endMatch, syncLanesToReact],
  )

  const handleTimeUp = useCallback(
    (l1: LaneState, l2: LaneState) => {
      const result = resolveRoundByScore(l1, l2)
      finishRound(result, l1, l2)
    },
    [finishRound],
  )

  const passTurn = useCallback(() => {
    const next: ShootTurn = activeTurnRef.current === 'p1' ? 'p2' : 'p1'
    activeTurnRef.current = next
    setActiveTurn(next)
    if (next === 'p2') {
      const nowSec = performance.now() / 1000
      botRef.current.fireAt = nowSec + 0.45
    }
  }, [])

  useEffect(() => {
    if (!running) return

    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      if (!runningRef.current || endedRef.current) return

      const inBreak = now < roundBreakUntilRef.current
      if (inBreak) {
        raf = requestAnimationFrame(tick)
        return
      }

      const dt = Math.min((now - last) / 1000, 0.028)
      last = now
      const nowSec = now / 1000

      roundTimeRef.current = Math.max(0, roundTimeRef.current - dt)

      const wantsFire = fireRef.current && activeTurnRef.current === 'p1'
      const wantsSwap = swapRef.current && activeTurnRef.current === 'p1'
      fireRef.current = false
      swapRef.current = false

      const prev1 = lane1Ref.current
      const r1 = updateLane(prev1, aimDirRef.current, dt, wantsFire, wantsSwap)
      playEvents(r1.events, 'p1')

      const prev2 = lane2Ref.current
      const r2 = updateBotLane(prev2, dt, nowSec, botRef.current, activeTurnRef.current === 'p2')
      playEvents(r2.events, 'p2')

      lane1Ref.current = r1.lane
      lane2Ref.current = r2.lane
      lane1RenderRef.current = r1.lane
      lane2RenderRef.current = r2.lane

      const p1ShotDone = Boolean(prev1.projectile && !r1.lane.projectile && r1.lane.canShoot)
      const p2ShotDone = Boolean(prev2.projectile && !r2.lane.projectile && r2.lane.canShoot)
      if (p1ShotDone || p2ShotDone) {
        passTurn()
      }

      syncUiTickRef.current += 1
      const forceUi =
        wantsFire ||
        wantsSwap ||
        p1ShotDone ||
        p2ShotDone ||
        r1.events.length > 0 ||
        r2.events.length > 0
      if (forceUi || syncUiTickRef.current % 2 === 0) {
        syncLanesToReact(r1.lane, r2.lane, roundTimeRef.current)
      }

      if (roundTimeRef.current <= 0 && !roundEndingRef.current) {
        roundEndingRef.current = true
        handleTimeUp(r1.lane, r2.lane)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, playEvents, passTurn, handleTimeUp, syncLanesToReact])

  const setAimDirection = useCallback((dir: -1 | 0 | 1) => {
    if (activeTurnRef.current !== 'p1') return
    aimDirRef.current = dir
    setAimDir(dir)
  }, [])

  const fire = useCallback(() => {
    if (!runningRef.current || endedRef.current) return
    if (performance.now() < roundBreakUntilRef.current) return
    if (activeTurnRef.current !== 'p1') return
    if (lane1Ref.current.projectile || !lane1Ref.current.canShoot) return
    fireRef.current = true
  }, [])

  const swapBubble = useCallback(() => {
    if (!runningRef.current || endedRef.current) return
    if (performance.now() < roundBreakUntilRef.current) return
    if (activeTurnRef.current !== 'p1') return
    if (lane1Ref.current.projectile || !lane1Ref.current.canShoot) return
    swapRef.current = true
  }, [])

  const restart = useCallback(() => {
    const nowSec = performance.now() / 1000
    endedRef.current = false
    runningRef.current = true
    fireRef.current = false
    swapRef.current = false
    roundBreakUntilRef.current = 0
    roundSeedRef.current = 3
    roundNumberRef.current = 1
    isOvertimeRef.current = false
    roundTimeRef.current = ROUND_SECONDS
    roundEndingRef.current = false
    botRef.current = createBotBrain(nowSec)
    const l1 = createLane(11)
    const l2 = createLane(12)
    lane1Ref.current = l1
    lane2Ref.current = l2
    lane1RenderRef.current = l1
    lane2RenderRef.current = l2
    syncUiTickRef.current = 0
    setRoundNumber(1)
    setRoundMessage(null)
    setIsRoundBreak(false)
    setIsOvertime(false)
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(ROUND_SECONDS)
    setWinner(null)
    setRunning(true)
    setShakeKey(0)
    setAimDir(0)
    aimDirRef.current = 0
    activeTurnRef.current = 'p1'
    setActiveTurn('p1')
  }, [])

  const formatTime = `${String(Math.floor(roundTimeLeft / 60)).padStart(2, '0')}:${String(roundTimeLeft % 60).padStart(2, '0')}`

  return {
    lane1,
    lane2,
    formatTime,
    roundNumber,
    roundMessage,
    isRoundBreak,
    isOvertime,
    winPoints: WIN_POINTS,
    running,
    winner,
    shakeKey,
    activeTurn,
    lane1RenderRef,
    lane2RenderRef,
    setAimDirection,
    fire,
    swapBubble,
    restart,
  }
}
