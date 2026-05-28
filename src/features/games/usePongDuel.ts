import { useCallback, useEffect, useRef, useState } from 'react'
import { updateBotPaddle } from './utils/pongDuelBot'
import {
  createPongState,
  MATCH_ROUNDS,
  POINTS_TO_WIN,
  resetBall,
  resolveRoundWinner,
  ROUND_BREAK_MS,
  setPaddle1,
  tickPong,
  WIN_ROUNDS,
  type PongState,
} from './utils/pongDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

export function usePongDuel() {
  const [game, setGame] = useState<PongState>(() => createPongState(901))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundMessage, setRoundMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const roundNumberRef = useRef(1)
  const roundEndingRef = useRef(false)
  const endedRef = useRef(false)
  const seedRef = useRef(901)
  const pauseUntilRef = useRef(0)

  gameRef.current = game

  const endRound = useCallback(() => {
    if (roundEndingRef.current) return
    roundEndingRef.current = true

    const g = gameRef.current
    const rw = resolveRoundWinner(g.lane1, g.lane2)
    let lane1 = g.lane1
    let lane2 = g.lane2
    if (rw === 'p1') lane1 = { ...lane1, matchPoints: lane1.matchPoints + 1 }
    else if (rw === 'p2') lane2 = { ...lane2, matchPoints: lane2.matchPoints + 1 }

    const next = { ...g, lane1, lane2 }
    gameRef.current = next
    setGame(next)

    setRoundMessage(rw === 'draw' ? 'ROUND BERABERE' : rw === 'p1' ? 'ROUND KAZANDIN' : 'ROUND KAYBETTİN')

    const matchOver =
      lane1.matchPoints >= WIN_ROUNDS || lane2.matchPoints >= WIN_ROUNDS || roundNumberRef.current >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          lane1.matchPoints > lane2.matchPoints ? 'p1' : lane2.matchPoints > lane1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        setRoundMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      roundNumberRef.current += 1
      setRoundNumber(roundNumberRef.current)
      seedRef.current += 53
      const fresh = createPongState(seedRef.current)
      fresh.lane1 = { ...fresh.lane1, matchPoints: lane1.matchPoints }
      fresh.lane2 = { ...fresh.lane2, matchPoints: lane2.matchPoints }
      gameRef.current = fresh
      setGame(fresh)
      roundEndingRef.current = false
      setRoundMessage(null)
    }, ROUND_BREAK_MS)
  }, [])

  const checkRoundEnd = useCallback((g: PongState) => {
    if (g.lane1.score >= POINTS_TO_WIN || g.lane2.score >= POINTS_TO_WIN) {
      endRound()
    }
  }, [endRound])

  useEffect(() => {
    if (!running || roundMessage || endedRef.current) return

    let frame = 0
    const loop = () => {
      if (endedRef.current || roundEndingRef.current || roundMessage) return

      if (performance.now() < pauseUntilRef.current) {
        frame = window.requestAnimationFrame(loop)
        return
      }

      let g = gameRef.current
      g = updateBotPaddle(g, 0.8)
      const { state, scored } = tickPong(g)
      g = state

      if (scored) {
        pauseUntilRef.current = performance.now() + 700
        const toward: 1 | 2 = scored === 1 ? 2 : 1
        seedRef.current += 1
        g = resetBall(g, toward, seedRef.current)
        checkRoundEnd(g)
      }

      gameRef.current = g
      setGame(g)
      frame = window.requestAnimationFrame(loop)
    }

    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [checkRoundEnd, running, roundMessage])

  const movePaddle = useCallback(
    (yNorm: number) => {
      if (!running || roundEndingRef.current || endedRef.current || roundMessage) return
      const next = setPaddle1(gameRef.current, yNorm)
      gameRef.current = next
      setGame(next)
    },
    [running, roundMessage],
  )

  const restartMatch = useCallback(() => {
    endedRef.current = false
    roundEndingRef.current = false
    roundNumberRef.current = 1
    seedRef.current = 901 + Math.floor(Math.random() * 400)
    const fresh = createPongState(seedRef.current)
    gameRef.current = fresh
    setGame(fresh)
    setRoundNumber(1)
    setRoundMessage(null)
    setWinner(null)
    setRunning(true)
    pauseUntilRef.current = 0
  }, [])

  return {
    game,
    roundNumber,
    roundMessage,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    movePaddle,
    restartMatch,
  }
}
