import { useCallback, useEffect, useRef, useState } from 'react'
import { botMistakeChance, botTapDelayMs, pickBotWrongPad } from './utils/simonDuelBot'
import {
  advanceShow,
  applyTap,
  beginRound,
  createSimonState,
  MATCH_ROUNDS,
  MAX_SEQ_LEN,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  WIN_ROUNDS,
  type PadId,
  type SimonState,
} from './utils/simonDuelEngine'

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

export function useSimonDuel() {
  const [game, setGame] = useState<SimonState>(() => createSimonState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const runningRef = useRef(true)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(2207)
  const botTimerRef = useRef<number | null>(null)
  const loopRef = useRef<number | null>(null)

  gameRef.current = game
  runningRef.current = running

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const startRound = useCallback(() => {
    const now = performance.now()
    const rand = mulberry32(seedRef.current++)
    const next = beginRound(gameRef.current, now, rand)
    gameRef.current = next
    setGame(next)
  }, [])

  const checkLegEnd = useCallback((g: SimonState) => {
    if (g.lane1.score >= POINTS_TO_WIN || g.lane2.score >= POINTS_TO_WIN) {
      endLegRef.current()
    }
  }, [])

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    clearBot()

    const g = gameRef.current
    const rw = resolveLegWinner(g.lane1, g.lane2)
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    const next: SimonState = {
      ...g,
      lane1: l1,
      lane2: l2,
      phase: 'idle',
      highlightPad: null,
    }
    gameRef.current = next
    setGame(next)

    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : 'LEG KAYBETTİN')

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      seedRef.current += 17
      const fresh = createSimonState()
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      fresh.seqLength = Math.min(MAX_SEQ_LEN, g.seqLength + 1)
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      startRound()
    }, ROUND_BREAK_MS)
  }, [clearBot, startRound])

  endLegRef.current = endLeg

  const scheduleBotTap = useCallback(() => {
    clearBot()
    if (endedRef.current || legEndingRef.current || legMessage) return

    const g = gameRef.current
    if (g.phase !== 'input' || g.roundLocked) return

    const lane = g.lane2
    const expected = g.sequence[lane.inputIndex]
    if (expected == null) return

    const delay = botTapDelayMs(lane.inputIndex, g.sequence.length)
    botTimerRef.current = window.setTimeout(() => {
      const cur = gameRef.current
      if (cur.phase !== 'input' || cur.roundLocked) return

      const l2 = cur.lane2
      const exp = cur.sequence[l2.inputIndex]
      if (exp == null) return

      let pad: PadId = exp
      if (botMistakeChance(cur.sequence.length) > Math.random()) {
        pad = pickBotWrongPad(exp)
      }

      const next = applyTap(cur, 2, pad, performance.now())
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)

      if (next.phase === 'input' && !next.roundLocked) {
        scheduleBotTap()
      }
    }, delay)
  }, [checkLegEnd, clearBot, legMessage])

  useEffect(() => {
    if (!running || legMessage) return
    startRound()
  }, [running, legMessage, startRound])

  useEffect(() => {
    if (!running || endedRef.current || legMessage) return

    const tick = () => {
      const now = performance.now()
      let g = gameRef.current

      if (g.phase === 'show') {
        const advanced = advanceShow(g, now)
        if (advanced !== g) {
          g = advanced
          gameRef.current = g
          setGame(g)
        }
      }

      if (g.phase === 'break' && now >= g.breakUntil && !legEndingRef.current) {
        checkLegEnd(g)
        if (!legEndingRef.current) {
          const bumped = {
            ...g,
            seqLength: Math.min(MAX_SEQ_LEN, g.seqLength + 1),
            phase: 'idle' as const,
            roundLocked: false,
            roundWinner: null,
            highlightPad: null,
          }
          gameRef.current = bumped
          setGame(bumped)
          startRound()
        }
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [checkLegEnd, legMessage, running, startRound])

  useEffect(() => {
    if (game.phase === 'input' && !game.roundLocked) {
      scheduleBotTap()
    }
    return () => clearBot()
  }, [game.phase, game.roundLocked, scheduleBotTap, clearBot])

  const tapP1 = useCallback(
    (pad: PadId) => {
      if (!running || legEndingRef.current || endedRef.current) return
      const next = applyTap(gameRef.current, 1, pad, performance.now())
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)
    },
    [checkLegEnd, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 2207 + Math.floor(Math.random() * 400)
    const fresh = createSimonState()
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
  }, [clearBot])

  return {
    game,
    legMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    tapP1,
    restartMatch,
  }
}
