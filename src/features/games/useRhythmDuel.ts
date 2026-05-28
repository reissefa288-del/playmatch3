import { useCallback, useEffect, useRef, useState } from 'react'
import { botHitOffsetMs, botMissChance, pickBotNote, pickBotWrongLane } from './utils/rhythmDuelBot'
import {
  createRhythmState,
  legShouldEnd,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resolveLegWinner,
  resolveMissedNotes,
  ROUND_BREAK_MS,
  spawnNote,
  tapLane,
  WIN_ROUNDS,
  type LaneId,
  type RhythmState,
} from './utils/rhythmDuelEngine'

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

export function useRhythmDuel() {
  const [game, setGame] = useState<RhythmState>(() => createRhythmState(performance.now()))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(5501)
  const loopRef = useRef<number | null>(null)
  const botHitsRef = useRef<Set<number>>(new Set())

  gameRef.current = game

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    botHitsRef.current.clear()

    const g = gameRef.current
    const rw = resolveLegWinner(g.lane1, g.lane2)
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    const next = { ...g, notes: [], lane1: l1, lane2: l2 }
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
      seedRef.current += 31
      const t = performance.now()
      const fresh = createRhythmState(t)
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      botHitsRef.current.clear()
    }, ROUND_BREAK_MS)
  }, [])

  endLegRef.current = endLeg

  const tickBot = useCallback((g: RhythmState, t: number) => {
    const note = pickBotNote(g.notes, t + botHitOffsetMs())
    if (!note || botHitsRef.current.has(note.id)) return g

    if (botMissChance(g.lane2.combo) > Math.random()) {
      botHitsRef.current.add(note.id)
      return tapLane(g, 2, pickBotWrongLane(note.lane), t)
    }

    botHitsRef.current.add(note.id)
    return tapLane(g, 2, note.lane, t + botHitOffsetMs())
  }, [])

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return

    const tick = () => {
      const t = performance.now()
      setNow(t)

      if (legEndingRef.current || endedRef.current) {
        loopRef.current = window.requestAnimationFrame(tick)
        return
      }

      const prev = gameRef.current
      let g = prev
      const rand = mulberry32(seedRef.current++)

      if (t >= g.nextSpawnAt && t < g.legEndsAt - 800) {
        g = spawnNote(g, t, rand)
      }

      g = resolveMissedNotes(g, t)
      g = tickBot(g, t)
      g = { ...g, notes: g.notes.filter((n) => !n.resolved || t - n.hitAt < 2500).slice(-48) }

      if (legShouldEnd(g, t)) {
        gameRef.current = g
        setGame(g)
        endLegRef.current()
      } else if (g !== prev) {
        gameRef.current = g
        setGame(g)
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [legMessage, running, tickBot])

  const tapP1 = useCallback(
    (lane: LaneId) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const t = performance.now()
      const next = tapLane(gameRef.current, 1, lane, t)
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 5501 + Math.floor(Math.random() * 400)
    botHitsRef.current.clear()
    const fresh = createRhythmState(performance.now())
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setWinner(null)
    setRunning(true)
  }, [])

  const legTimeLeft = Math.max(0, Math.ceil((game.legEndsAt - now) / 1000))

  return {
    game,
    now,
    legMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    legTimeLeft,
    tapP1,
    restartMatch,
  }
}
