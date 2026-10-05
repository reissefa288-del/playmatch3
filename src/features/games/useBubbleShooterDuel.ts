import { useCallback, useEffect, useRef, useState } from 'react'
import { useManagedTimeout } from '../../shared/useManagedTimeout'
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
import { ROUND_BREAK_MS, pulseBubbleHaptic, type SpecialKind } from './utils/bubbleShooterMeta'
import {
  playBubbleSound,
  playBubbleSoundOnGesture,
  shootSoundForKind,
  unlockBubbleAudio,
  type BubbleSoundId,
} from './utils/bubbleShooterSounds'

type MatchResult = 'p1' | 'p2' | 'draw'
type RoundWinner = 'p1' | 'p2' | 'draw'

const SHOOT_KIND_EVENT: Partial<Record<LaneEvent, SpecialKind>> = {
  shoot_fire: 'fire',
  shoot_bomb: 'bomb',
  shoot_rainbow: 'rainbow',
  shoot_ice: 'ice',
}

function updateBotLane(
  lane: LaneState,
  dt: number,
  nowSec: number,
  bot: BotBrain,
): { lane: LaneState; events: LaneEvent[] } {
  const events: LaneEvent[] = []

  if (nowSec >= bot.thinkAt) {
    const decision = getBotDecision(lane)
    bot.targetAngle = decision.targetAngle
    bot.quality = decision.quality
    bot.pendingSwap = decision.shouldSwap
    bot.thinkAt = nowSec + 0.28 + Math.random() * 0.12
  }

  const nextAngle = smoothBotAim(lane.aimAngle, bot.targetAngle, dt, bot.quality)
  const working: LaneState = { ...lane, aimAngle: nextAngle, aimVel: 0 }
  const aligned = Math.abs(bot.targetAngle - nextAngle) < 0.08

  if (bot.pendingSwap && working.canShoot && !working.projectile) {
    bot.pendingSwap = false
    const swapped = updateLane(working, 0, dt, false, true)
    events.push(...swapped.events)
    bot.fireAt = nowSec + botFireDelay(bot.quality) * 0.35
    return { lane: swapped.lane, events }
  }

  const shouldFire = nowSec >= bot.fireAt && aligned && working.canShoot && !working.projectile
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
    fireAt: nowSec + 0.75,
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
  const [rivalAimFlash, setRivalAimFlash] = useState(false)

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
  lane1Ref.current = lane1
  lane2Ref.current = lane2
  lane1RenderRef.current = lane1
  lane2RenderRef.current = lane2
  aimDirRef.current = aimDir
  runningRef.current = running

  const breakTimer = useManagedTimeout()
  const rivalAimTimer = useManagedTimeout()

  const syncLanesToReact = useCallback((l1: LaneState, l2: LaneState, timeDisplay: number) => {
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(Math.ceil(timeDisplay))
  }, [])

  const flashRivalAim = useCallback(() => {
    setRivalAimFlash(true)
    rivalAimTimer.schedule(() => setRivalAimFlash(false), 480)
  }, [rivalAimTimer])

  const playEvents = useCallback(
    (events: LaneEvent[], side: 'p1' | 'p2') => {
      for (const event of events) {
        const shootKind = SHOOT_KIND_EVENT[event]
        if (shootKind) {
          if (side === 'p2') {
            playBubbleSound(shootSoundForKind(shootKind))
            pulseBubbleHaptic(shootKind)
            flashRivalAim()
          } else {
            pulseBubbleHaptic(shootKind)
          }
          continue
        }

        if (event === 'shoot') {
          if (side === 'p2') {
            playBubbleSound('shoot')
            flashRivalAim()
          }
          continue
        }

        if (event === 'swap' && side === 'p2') playBubbleSound('swap')
        else if (event === 'overflow') {
          playBubbleSound('overflow')
          pulseBubbleHaptic('overflow')
        } else if (
          event === 'pop' ||
          event === 'drop' ||
          event === 'combo' ||
          event === 'special' ||
          event === 'clear' ||
          event === 'refill' ||
          event === 'burst'
        ) {
          playBubbleSound()
        }
      }
    },
    [flashRivalAim],
  )

  const endMatch = useCallback((result: MatchResult) => {
    if (endedRef.current) return
    endedRef.current = true
    runningRef.current = false
    setRunning(false)
    setIsRoundBreak(false)
    setRoundMessage(null)
    setWinner(result)
    playBubbleSound(result === 'p1' ? 'win' : result === 'p2' ? 'lose' : 'round')
  }, [])

  const beginNextRound = useCallback(
    (l1: LaneState, l2: LaneState) => {
      if (endedRef.current) return
      roundSeedRef.current += 1
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
      setRoundMessage(null)
      setIsRoundBreak(false)
      roundBreakUntilRef.current = 0
      syncLanesToReact(next1, next2, ROUND_SECONDS)
      botRef.current = createBotBrain(performance.now() / 1000)
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
      syncLanesToReact(next1, next2, roundTimeRef.current)

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
        endMatch(matchResult)
        return
      }

      const msg =
        roundWinner === 'p1'
          ? 'EMİR +1 TUR'
          : roundWinner === 'p2'
            ? 'ZEYNEP +1 TUR'
            : 'TUR BERABERE'

      setRoundMessage(msg)
      setIsRoundBreak(true)
      playBubbleSound('round')
      roundBreakUntilRef.current = performance.now() + ROUND_BREAK_MS

      breakTimer.schedule(() => {
        if (endedRef.current) return
        roundNumberRef.current += 1
        setRoundNumber(roundNumberRef.current)
        beginNextRound(next1, next2)
      }, ROUND_BREAK_MS)
    },
    [beginNextRound, breakTimer, endMatch, syncLanesToReact],
  )

  const handleTimeUp = useCallback(
    (l1: LaneState, l2: LaneState) => {
      const result = resolveRoundByScore(l1, l2)
      finishRound(result, l1, l2)
    },
    [finishRound],
  )

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

      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      const nowSec = now / 1000

      roundTimeRef.current = Math.max(0, roundTimeRef.current - dt)

      const wantsFire = fireRef.current
      const wantsSwap = swapRef.current
      fireRef.current = false
      swapRef.current = false

      const r1 = updateLane(lane1Ref.current, aimDirRef.current, dt, wantsFire, wantsSwap)
      playEvents(r1.events, 'p1')

      const r2 = updateBotLane(lane2Ref.current, dt, nowSec, botRef.current)
      playEvents(r2.events, 'p2')

      lane1Ref.current = r1.lane
      lane2Ref.current = r2.lane
      lane1RenderRef.current = r1.lane
      lane2RenderRef.current = r2.lane

      syncUiTickRef.current += 1
      const forceUi =
        wantsFire ||
        wantsSwap ||
        aimDirRef.current !== 0 ||
        r1.events.length > 0 ||
        r2.events.length > 0
      if (forceUi || syncUiTickRef.current % 6 === 0) {
        syncLanesToReact(r1.lane, r2.lane, roundTimeRef.current)
      }

      if (!roundEndingRef.current) {
        if (r1.lane.overflowed) {
          roundEndingRef.current = true
          finishRound('p2', r1.lane, r2.lane)
        } else if (r2.lane.overflowed) {
          roundEndingRef.current = true
          finishRound('p1', r1.lane, r2.lane)
        }
      }

      if (roundTimeRef.current <= 0 && !roundEndingRef.current) {
        roundEndingRef.current = true
        handleTimeUp(r1.lane, r2.lane)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, playEvents, handleTimeUp, finishRound, syncLanesToReact])

  useEffect(() => {
    return () => {
      rivalAimTimer.clear()
      breakTimer.clear()
    }
  }, [breakTimer, rivalAimTimer])

  const setAimDirection = useCallback((dir: -1 | 0 | 1) => {
    if (dir !== 0) unlockBubbleAudio()
    aimDirRef.current = dir
    setAimDir(dir)
  }, [])

  const setAimAngle = useCallback((angle: number) => {
    if (!runningRef.current || endedRef.current) return
    if (performance.now() < roundBreakUntilRef.current) return
    const l1 = lane1Ref.current
    if (l1.projectile || !l1.canShoot) return
    lane1Ref.current = { ...l1, aimAngle: angle, aimVel: 0 }
    lane1RenderRef.current = lane1Ref.current
    setLane1(lane1Ref.current)
  }, [])

  const fire = useCallback(() => {
    if (!runningRef.current || endedRef.current) return
    if (performance.now() < roundBreakUntilRef.current) return
    const lane = lane1Ref.current
    if (lane.projectile || !lane.canShoot) return
    const sound = shootSoundForKind(lane.currentKind) as BubbleSoundId
    playBubbleSoundOnGesture(sound)
    fireRef.current = true
  }, [])

  const swapBubble = useCallback(() => {
    if (!runningRef.current || endedRef.current) return
    if (performance.now() < roundBreakUntilRef.current) return
    if (lane1Ref.current.projectile || !lane1Ref.current.canShoot) return
    playBubbleSoundOnGesture('swap')
    swapRef.current = true
  }, [])

  const restart = useCallback(() => {
    unlockBubbleAudio()
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
    setRivalAimFlash(false)
    setLane1(l1)
    setLane2(l2)
    setRoundTimeLeft(ROUND_SECONDS)
    setWinner(null)
    setRunning(true)
    setAimDir(0)
    aimDirRef.current = 0
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
    rivalAimFlash,
    winPoints: WIN_POINTS,
    running,
    winner,
    lane1RenderRef,
    lane2RenderRef,
    setAimDirection,
    setAimAngle,
    fire,
    swapBubble,
    restart,
  }
}
