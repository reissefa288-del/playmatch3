import { useCallback, useEffect, useRef, useState } from 'react'
import { botCatchDelayMs, botMissChance, pickBotCatchItem } from './utils/catchDuelBot'
import {
  createCatchState,
  legShouldEnd,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  pruneItems,
  resolveLegWinner,
  ROUND_BREAK_MS,
  spawnItem,
  tryCatch,
  WIN_ROUNDS,
  type CatchState,
  type LaneId,
} from './utils/catchDuelEngine'

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

export function useCatchDuel() {
  const [game, setGame] = useState<CatchState>(() => createCatchState(performance.now()))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(6607)
  const botCaughtRef = useRef<Set<number>>(new Set())
  const loopRef = useRef<number | null>(null)

  gameRef.current = game

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    botCaughtRef.current.clear()

    const g = gameRef.current
    const rw = resolveLegWinner(g.p1, g.p2)
    let p1 = { ...g.p1, items: [] }
    let p2 = { ...g.p2, items: [] }
    if (rw === 'p1') p1 = { ...p1, matchPoints: p1.matchPoints + 1 }
    else if (rw === 'p2') p2 = { ...p2, matchPoints: p2.matchPoints + 1 }

    const next = { ...g, p1, p2 }
    gameRef.current = next
    setGame(next)
    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : 'LEG KAYBETTİN')

    const matchOver =
      p1.matchPoints >= WIN_ROUNDS || p2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          p1.matchPoints > p2.matchPoints ? 'p1' : p2.matchPoints > p1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      seedRef.current += 37
      const t = performance.now()
      const fresh = createCatchState(t)
      fresh.roundNumber = g.roundNumber + 1
      fresh.p1.matchPoints = p1.matchPoints
      fresh.p2.matchPoints = p2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      botCaughtRef.current.clear()
    }, ROUND_BREAK_MS)
  }, [])

  endLegRef.current = endLeg

  const tickBot = useCallback((g: CatchState, t: number) => {
    const item = pickBotCatchItem(g.p2.items, t + botCatchDelayMs())
    if (!item || botCaughtRef.current.has(item.id)) return g
    if (botMissChance() > Math.random()) return g

    botCaughtRef.current.add(item.id)
    const p2 = tryCatch(g.p2, item.lane, t + botCatchDelayMs())
    return { ...g, p2 }
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
      const rand1 = mulberry32(seedRef.current++)
      const rand2 = mulberry32(seedRef.current + 11)

      let p1 = pruneItems(g.p1, t)
      let p2 = pruneItems(g.p2, t)

      if (t < g.legEndsAt - 600) {
        if (t >= p1.nextSpawnAt) {
          const s1 = spawnItem(p1, t, g.nextItemId, rand1)
          p1 = s1.side
          g = { ...g, nextItemId: s1.nextId }
        }
        if (t >= p2.nextSpawnAt) {
          const s2 = spawnItem(p2, t, g.nextItemId, rand2)
          p2 = s2.side
          g = { ...g, nextItemId: s2.nextId }
        }
      }

      g = { ...g, p1, p2 }
      g = tickBot(g, t)

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

  const catchP1 = useCallback(
    (lane: LaneId) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const t = performance.now()
      const p1 = tryCatch(gameRef.current.p1, lane, t)
      if (p1 === gameRef.current.p1) return
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    legEndingRef.current = false
    seedRef.current = 6607 + Math.floor(Math.random() * 500)
    botCaughtRef.current.clear()
    const fresh = createCatchState(performance.now())
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
    catchP1,
    restartMatch,
  }
}
