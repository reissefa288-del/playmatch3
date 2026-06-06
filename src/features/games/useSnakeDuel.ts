import { useCallback, useEffect, useRef, useState } from 'react'
import { pickBotDirection } from './utils/snakeDuelBot'
import {
  canRespawnLane,
  createLane,
  DEATH_RESPAWN_MS,
  MATCH_ROUNDS,
  queueDirection,
  respawnLane,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  ROUND_SECONDS,
  START_LENGTH,
  TICK_MS,
  tickIntervalMs,
  tickLane,
  WIN_ROUNDS,
  type Direction,
  type SnakeLaneState,
} from './utils/snakeDuelEngine'
import { playSnakeDuelSound, unlockSnakeDuelAudio } from './utils/snakeDuelSounds'

type MatchWinner = 'p1' | 'p2' | 'draw'

const TUTORIAL_KEY = 'pm-snake-duel-tutorial-nokia-v1'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function processPlayerLaneFx(prev: SnakeLaneState, next: SnakeLaneState) {
  if (next.pickupFx && next.pickupFx.tick !== prev.pickupFx?.tick) {
    if (next.pickupFx.kind === 'food') playSnakeDuelSound('eat')
    else playSnakeDuelSound('diamond')
  }

  if (next.diamond !== null && prev.diamond === null) {
    playSnakeDuelSound('spawn')
  }

  return !next.alive && prev.alive && prev.simTick > 0
}

function deathMessage() {
  return 'KENDİNE ÇARPTIN!'
}

export function useSnakeDuel() {
  const [lane1, setLane1] = useState<SnakeLaneState>(() => createLane(1, 301))
  const [lane2, setLane2] = useState<SnakeLaneState>(() => createLane(2, 509))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [playerDeathMsg, setPlayerDeathMsg] = useState<string | null>(null)
  const deathMsgTimerRef = useRef(0)
  const respawnAtMsRef = useRef({ p1: 0, p2: 0 })
  const [tutorialOpen, setTutorialOpen] = useState(
    () => typeof window !== 'undefined' && !window.localStorage.getItem(TUTORIAL_KEY),
  )

  const lane1Ref = useRef(lane1)
  const lane2Ref = useRef(lane2)
  const roundNumberRef = useRef(1)
  const roundTimeRef = useRef(ROUND_SECONDS)
  const roundEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(301)
  const loopActiveRef = useRef(false)
  const shakeTimerRef = useRef(0)

  lane1Ref.current = lane1
  lane2Ref.current = lane2

  const pulseShake = useCallback(() => {
    setScreenShake(true)
    window.clearTimeout(shakeTimerRef.current)
    shakeTimerRef.current = window.setTimeout(() => setScreenShake(false), 380)
  }, [])

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

    playSnakeDuelSound('round')
    if (rw === 'p1') pulseShake()

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
        if (final === 'p1') playSnakeDuelSound('win')
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
  }, [pulseShake])

  useEffect(() => {
    if (!running || endedRef.current || roundMessage) {
      loopActiveRef.current = false
      return
    }

    loopActiveRef.current = true
    let timeoutId = 0

    const step = () => {
      if (!loopActiveRef.current || roundEndingRef.current || endedRef.current || tutorialOpen) return

      seedRef.current += 1
      const rand1 = mulberry32(seedRef.current * 2 + 1)
      const rand2 = mulberry32(seedRef.current * 2 + 2)

      const prev1 = lane1Ref.current
      const prev2 = lane2Ref.current
      let l1 = prev1
      let l2 = prev2

      const botDir = pickBotDirection(l2, rand2)
      l2 = queueDirection(l2, botDir)

      l1 = tickLane(l1, rand1)
      l2 = tickLane(l2, rand2)

      const playerDied = processPlayerLaneFx(prev1, l1)
      const botDied = !l2.alive && prev2.alive

      if (playerDied) {
        playSnakeDuelSound('die')
        pulseShake()
        respawnAtMsRef.current.p1 = Date.now() + DEATH_RESPAWN_MS
        setPlayerDeathMsg(deathMessage())
        window.clearTimeout(deathMsgTimerRef.current)
        deathMsgTimerRef.current = window.setTimeout(() => setPlayerDeathMsg(null), DEATH_RESPAWN_MS + 400)
      } else if (l1.pickupFx?.kind === 'diamond' && l1.pickupFx.tick !== prev1.pickupFx?.tick) {
        pulseShake()
      }

      if (botDied) {
        respawnAtMsRef.current.p2 = Date.now() + DEATH_RESPAWN_MS
      }

      const now = Date.now()
      const canRespawnP1 =
        !l1.alive &&
        canRespawnLane(l1) &&
        respawnAtMsRef.current.p1 > 0 &&
        now >= respawnAtMsRef.current.p1
      const canRespawnP2 =
        !l2.alive &&
        canRespawnLane(l2) &&
        respawnAtMsRef.current.p2 > 0 &&
        now >= respawnAtMsRef.current.p2

      if (canRespawnP1) {
        l1 = respawnLane(l1, seedRef.current + 7)
        respawnAtMsRef.current.p1 = 0
        setPlayerDeathMsg(null)
        playSnakeDuelSound('spawn')
      }
      if (canRespawnP2) {
        l2 = respawnLane(l2, seedRef.current + 13)
        respawnAtMsRef.current.p2 = 0
      }

      const len1 = l1.alive ? l1.length : START_LENGTH
      const len2 = l2.alive ? l2.length : START_LENGTH

      lane1Ref.current = l1
      lane2Ref.current = l2
      setLane1(l1)
      setLane2(l2)

      const elapsedSec = ROUND_SECONDS - roundTimeRef.current
      const delay = tickIntervalMs(len1, len2, elapsedSec)
      timeoutId = window.setTimeout(step, delay)
    }

    timeoutId = window.setTimeout(step, TICK_MS)

    return () => {
      loopActiveRef.current = false
      window.clearTimeout(timeoutId)
    }
  }, [pulseShake, running, roundMessage, tutorialOpen])

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

  useEffect(() => {
    return () => {
      window.clearTimeout(shakeTimerRef.current)
      window.clearTimeout(deathMsgTimerRef.current)
    }
  }, [])

  const setDirection = useCallback(
    (dir: Direction) => {
      if (!running || roundEndingRef.current || endedRef.current || roundMessage) return
      if (!lane1Ref.current.alive) return
      unlockSnakeDuelAudio()
      const prev = lane1Ref.current
      const next = queueDirection(prev, dir)
      if (next.queuedDir !== prev.queuedDir) {
        playSnakeDuelSound('turn')
      }
      lane1Ref.current = next
      setLane1(next)
    },
    [running, roundMessage],
  )

  useEffect(() => {
    if (!running || endedRef.current || roundMessage) return

    const keyToDir: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      W: 'up',
      s: 'down',
      S: 'down',
      a: 'left',
      A: 'left',
      d: 'right',
      D: 'right',
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const dir = keyToDir[event.key]
      if (!dir || roundEndingRef.current || !lane1Ref.current.alive) return
      event.preventDefault()
      unlockSnakeDuelAudio()
      const prev = lane1Ref.current
      const next = queueDirection(prev, dir)
      if (next.queuedDir !== prev.queuedDir) {
        playSnakeDuelSound('turn')
      }
      lane1Ref.current = next
      setLane1(next)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [running, roundMessage])

  const restartMatch = useCallback(() => {
    unlockSnakeDuelAudio()
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
    setPlayerDeathMsg(null)
    respawnAtMsRef.current = { p1: 0, p2: 0 }
    setRunning(true)
  }, [])

  const ensureAudio = useCallback(() => {
    unlockSnakeDuelAudio()
  }, [])

  const dismissTutorial = useCallback(() => {
    window.localStorage.setItem(TUTORIAL_KEY, '1')
    setTutorialOpen(false)
    unlockSnakeDuelAudio()
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
    screenShake,
    playerDeathMsg,
    tutorialOpen,
    dismissTutorial,
    setDirection,
    restartMatch,
    ensureAudio,
  }
}
