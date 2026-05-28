import { useCallback, useEffect, useRef, useState } from 'react'
import { botThinkMs, pickBotMove } from './utils/chessDuelBot'
import {
  applyPlayerMove,
  createChessState,
  LEG_BREAK_MS,
  MATCH_ROUNDS,
  resolveLegWinner,
  selectSquare,
  WIN_ROUNDS,
  type ChessState,
} from './utils/chessDuelEngine'

type MatchWinner = 'p1' | 'p2' | 'draw'

export function useChessDuel() {
  const [game, setGame] = useState<ChessState>(() => createChessState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [matchWinner, setMatchWinner] = useState<MatchWinner | null>(null)

  const gameRef = useRef(game)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const botTimerRef = useRef<number | null>(null)

  gameRef.current = game

  const clearBot = useCallback(() => {
    if (botTimerRef.current != null) window.clearTimeout(botTimerRef.current)
    botTimerRef.current = null
  }, [])

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    clearBot()

    const g = gameRef.current
    const rw = resolveLegWinner(g.winner ?? 'draw')
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { matchPoints: l2.matchPoints + 1 }

    setLegMessage(
      g.endReason === 'stalemate'
        ? 'PAT — LEG BERABERE'
        : rw === 'p1'
          ? 'LEG KAZANDIN'
          : rw === 'p2'
            ? 'LEG KAYBETTİN'
            : 'LEG BERABERE',
    )

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setMatchWinner(final)
        setRunning(false)
        endedRef.current = true
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      const fresh = createChessState()
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegMessage(null)
    }, LEG_BREAK_MS)
  }, [clearBot])

  const runBot = useCallback(() => {
    clearBot()
    const g = gameRef.current
    if (g.phase !== 'playing' || g.turn !== 'b' || legEndingRef.current || legMessage) return

    botTimerRef.current = window.setTimeout(() => {
      const cur = gameRef.current
      if (cur.phase !== 'playing' || cur.turn !== 'b') return

      const move = pickBotMove(cur.board, 'b')
      if (!move) return

      const next = applyPlayerMove(cur, move.from, move.to)
      gameRef.current = next
      setGame(next)

      if (next.phase === 'ended') endLeg()
    }, botThinkMs())
  }, [clearBot, endLeg, legMessage])

  useEffect(() => {
    if (game.phase === 'ended' && !legEndingRef.current && !legMessage) {
      endLeg()
    }
  }, [game.phase, endLeg, legMessage])

  useEffect(() => {
    runBot()
    return () => clearBot()
  }, [game.turn, game.phase, runBot, clearBot])

  const tapSquare = useCallback(
    (sq: number) => {
      if (!running || legEndingRef.current || endedRef.current || legMessage) return
      const next = selectSquare(gameRef.current, sq)
      gameRef.current = next
      setGame(next)
    },
    [legMessage, running],
  )

  const restartMatch = useCallback(() => {
    clearBot()
    endedRef.current = false
    legEndingRef.current = false
    const fresh = createChessState()
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setMatchWinner(null)
    setRunning(true)
  }, [clearBot])

  return {
    game,
    legMessage,
    running,
    matchWinner,
    matchRounds: MATCH_ROUNDS,
    winRounds: WIN_ROUNDS,
    tapSquare,
    restartMatch,
  }
}
