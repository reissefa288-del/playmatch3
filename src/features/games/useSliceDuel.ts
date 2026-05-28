import { useCallback, useEffect, useRef, useState } from 'react'
import { botBombSliceChance, botSliceDelayMs, pickBotTarget } from './utils/sliceDuelBot'
import {
  applySwipe,
  botSliceObject,
  createSliceState,
  legShouldEnd,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  pruneObjects,
  resolveLegWinner,
  ROUND_BREAK_MS,
  spawnObject,
  WIN_ROUNDS,
  type SlicePoint,
  type SliceState,
} from './utils/sliceDuelEngine'

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

export function useSliceDuel() {
  const [game, setGame] = useState<SliceState>(() => createSliceState(performance.now()))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(8809)
  const botSlicedRef = useRef<Set<number>>(new Set())
  const loopRef = useRef<number | null>(null)

  gameRef.current = game

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    botSlicedRef.current.clear()

    const g = gameRef.current
    const rw = resolveLegWinner(g.p1, g.p2)
    let p1 = { ...g.p1, objects: [] }
    let p2 = { ...g.p2, objects: [] }
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
      seedRef.current += 41
      const t = performance.now()
      const fresh = createSliceState(t)
      fresh.roundNumber = g.roundNumber + 1
      fresh.p1.matchPoints = p1.matchPoints
      fresh.p2.matchPoints = p2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
      botSlicedRef.current.clear()
    }, ROUND_BREAK_MS)
  }, [])

  endLegRef.current = endLeg

  const tickBot = useCallback((g: SliceState, t: number) => {
    const target = pickBotTarget(g.p2.objects, t)
    if (!target || botSlicedRef.current.has(target.id)) return g
    if (target.kind === 'bomb' && botBombSliceChance() > Math.random()) return g

    botSlicedRef.current.add(target.id)
    const p2 = botSliceObject(g.p2, target, t + botSliceDelayMs())
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
      const rand2 = mulberry32(seedRef.current + 13)

      let p1 = pruneObjects(g.p1, t)
      let p2 = pruneObjects(g.p2, t)

      if (t < g.legEndsAt - 700) {
        if (t >= p1.nextSpawnAt) {
          const s1 = spawnObject(p1, t, g.nextObjectId, rand1)
          p1 = s1.side
          g = { ...g, nextObjectId: s1.nextId }
        }
        if (t >= p2.nextSpawnAt) {
          const s2 = spawnObject(p2, t, g.nextObjectId, rand2)
          p2 = s2.side
          g = { ...g, nextObjectId: s2.nextId }
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

  const swipeP1 = useCallback(
    (path: SlicePoint[]) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const t = performance.now()
      const p1 = applySwipe(gameRef.current.p1, path, t)
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
    seedRef.current = 8809 + Math.floor(Math.random() * 500)
    botSlicedRef.current.clear()
    const fresh = createSliceState(performance.now())
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
    swipeP1,
    restartMatch,
  }
}
