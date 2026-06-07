import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentVisible } from '../../shared/useDocumentVisible'
import { useManagedTimeout } from '../../shared/useManagedTimeout'
import { botBombSliceChance, botSliceDelayMs, pickBotTarget } from './utils/sliceDuelBot'
import {
  applySwipe,
  botSliceObject,
  createSliceState,
  legShouldEnd,
  MATCH_ROUNDS,
  LEG_DURATION_MS,
  pruneObjects,
  resolveLegWinner,
  ROUND_BREAK_MS,
  spawnObject,
  WIN_ROUNDS,
  type SlicePoint,
  type SliceSideState,
  type SliceState,
} from './utils/sliceDuelEngine'
import { playSliceDuelSound, unlockSliceDuelAudio } from './utils/sliceDuelSounds'

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

function playSideFx(prev: SliceSideState, next: SliceSideState) {
  if (next.lastFxUntil <= prev.lastFxUntil || !next.lastFx) return
  if (next.lastFx === 'bomb') playSliceDuelSound('bomb')
  else if (next.lastFx === 'ko') {
    playSliceDuelSound('bomb')
    playSliceDuelSound('ko')
  } else if (next.frenzyUntil > prev.frenzyUntil && next.frenzyUntil > performance.now()) {
    playSliceDuelSound('frenzy')
  } else if (next.lastFx === 'miss') playSliceDuelSound('miss')
  else if (next.lastFx === 'star') playSliceDuelSound('star')
  else if (next.lastFx === 'slice') {
    if (next.combo >= 3) playSliceDuelSound('combo')
    else playSliceDuelSound('slice')
  }
}

export function useSliceDuel() {
  const [game, setGame] = useState<SliceState>(() => createSliceState(performance.now()))
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [legPause, setLegPause] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [now, setNow] = useState(() => performance.now())

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(8809)
  const botSlicedRef = useRef<Set<number>>(new Set())
  const loopRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  gameRef.current = game

  const endLegRef = useRef<() => void>(() => {})
  const breakTimer = useManagedTimeout()
  const documentVisible = useDocumentVisible()

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    setLegPause(true)
    botSlicedRef.current.clear()

    const g = gameRef.current
    const rw = resolveLegWinner(g.p1, g.p2)
    let p1 = { ...g.p1, objects: [] }
    let p2 = { ...g.p2, objects: [] }
    if (rw === 'p1') p1 = { ...p1, matchPoints: p1.matchPoints + 1 }
    else if (rw === 'p2') p2 = { ...p2, matchPoints: p2.matchPoints + 1 }

    playSliceDuelSound(rw === 'p1' ? 'legWin' : rw === 'p2' ? 'legLose' : 'slice')

    const next = { ...g, p1, p2 }
    gameRef.current = next
    setGame(next)
    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : null)

    const matchOver =
      p1.matchPoints >= WIN_ROUNDS || p2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    breakTimer.schedule(() => {
      if (matchOver) {
        const final =
          p1.matchPoints > p2.matchPoints ? 'p1' : p2.matchPoints > p1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        playSliceDuelSound(final === 'p1' ? 'matchWin' : final === 'p2' ? 'matchLose' : 'slice')
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
      setLegPause(false)
      setLegMessage(null)
      botSlicedRef.current.clear()
    }, ROUND_BREAK_MS)
  }, [breakTimer])

  endLegRef.current = endLeg

  const tickBot = useCallback((g: SliceState, t: number) => {
    if (g.p2.knockedOut) return g
    const target = pickBotTarget(g.p2.objects, t)
    if (!target || botSlicedRef.current.has(target.id)) return g
    if (target.kind === 'bomb' && botBombSliceChance(g.p2.score) > Math.random()) return g

    botSlicedRef.current.add(target.id)
    const prev = g.p2
    const p2 = botSliceObject(g.p2, target, t + botSliceDelayMs(g.p2.score))
    playSideFx(prev, p2)
    return { ...g, p2 }
  }, [])

  useEffect(() => {
    if (!running || endedRef.current) return
    if (!startedRef.current) {
      startedRef.current = true
      unlockSliceDuelAudio()
      playSliceDuelSound('start')
    }
  }, [running])

  useEffect(() => {
    if (!running || legMessage || endedRef.current || !documentVisible) return

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

      if (p1.lastFx === 'miss' && p1.lastFxUntil > prev.p1.lastFxUntil) playSliceDuelSound('miss')
      if (p2.lastFx === 'miss' && p2.lastFxUntil > prev.p2.lastFxUntil) playSliceDuelSound('miss')

      if (t < g.legEndsAt - 700) {
        if (!p1.knockedOut && t >= p1.nextSpawnAt) {
          const s1 = spawnObject(p1, t, g.nextObjectId, rand1)
          p1 = s1.side
          g = { ...g, nextObjectId: s1.nextId }
        }
        if (!p2.knockedOut && t >= p2.nextSpawnAt) {
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
  }, [documentVisible, legMessage, running, tickBot])

  useEffect(() => {
    return () => breakTimer.clear()
  }, [breakTimer])

  const swipeP1 = useCallback(
    (path: SlicePoint[]) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage || legPause) return
      unlockSliceDuelAudio()
      const t = performance.now()
      const prev = gameRef.current.p1
      if (prev.knockedOut) return
      const p1 = applySwipe(prev, path, t)
      if (p1 === prev) return
      playSideFx(prev, p1)
      const next = { ...gameRef.current, p1 }
      gameRef.current = next
      setGame(next)
    },
    [legMessage, legPause, running],
  )

  const restartMatch = useCallback(() => {
    breakTimer.clear()
    endedRef.current = false
    legEndingRef.current = false
    startedRef.current = false
    seedRef.current = 8809 + Math.floor(Math.random() * 500)
    botSlicedRef.current.clear()
    const fresh = createSliceState(performance.now())
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setLegPause(false)
    setWinner(null)
    setRunning(true)
  }, [breakTimer])

  const legTimeLeft = Math.max(0, Math.ceil((game.legEndsAt - now) / 1000))

  return {
    game,
    now,
    legMessage,
    legPause,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    legDurationSec: LEG_DURATION_MS / 1000,
    legTimeLeft,
    swipeP1,
    restartMatch,
  }
}
