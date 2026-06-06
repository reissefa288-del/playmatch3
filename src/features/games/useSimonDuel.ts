import { useCallback, useEffect, useRef, useState } from 'react'
import { botMistakeChance, botTapDelayMs, pickBotWrongPad } from './utils/simonDuelBot'
import {
  advanceLaneShow,
  applyLaneTap,
  AUTO_START_MS,
  beginWatch,
  createSimonState,
  MATCH_ROUNDS,
  MAX_SEQ_LEN,
  POINTS_TO_WIN,
  resolveLegWinner,
  ROUND_BREAK_MS,
  SCORE_PAUSE_MS,
  WIN_ROUNDS,
  type PadId,
  type SimonState,
} from './utils/simonDuelEngine'
import {
  playSimonDuelSound,
  playSimonPadSound,
  unlockSimonDuelAudio,
} from './utils/simonDuelSounds'
import {
  createSimonRand,
  generateVariedSequence,
  rememberSequence,
} from './utils/simonDuelSequence'

type MatchWinner = 'p1' | 'p2' | 'draw'

function playLaneTapSounds(nextLane: ReturnType<typeof applyLaneTap>, pad: PadId) {
  if (nextLane.wrongFlashUntil > performance.now()) {
    playSimonDuelSound('wrong')
    return
  }
  if (nextLane.phase === 'input') {
    playSimonPadSound(pad)
    return
  }
  if (nextLane.lastScoreGain > 0) {
    if (nextLane.combo >= 2) playSimonDuelSound('combo')
    else playSimonDuelSound('score')
  }
}

export function useSimonDuel() {
  const [game, setGame] = useState<SimonState>(() => createSimonState())
  const [legMessage, setLegMessage] = useState<string | null>(null)
  const [legPause, setLegPause] = useState(false)
  const [running, setRunning] = useState(true)
  const [winner, setWinner] = useState<MatchWinner | null>(null)
  const [p1ScorePulse, setP1ScorePulse] = useState(0)
  const [p2ScorePulse, setP2ScorePulse] = useState(0)

  const gameRef = useRef(game)
  const runningRef = useRef(true)
  const legEndingRef = useRef(false)
  const endedRef = useRef(false)
  const legMessageRef = useRef<string | null>(null)
  const recentP1Ref = useRef(new Set<string>())
  const recentP2Ref = useRef(new Set<string>())
  const botTapTimerRef = useRef<number | null>(null)
  const autoStartTimersRef = useRef<{ p1: number | null; p2: number | null }>({ p1: null, p2: null })
  const loopRef = useRef<number | null>(null)
  const showSoundRef = useRef({ p1: '', p2: '' })
  const startedRef = useRef(false)

  gameRef.current = game
  runningRef.current = running
  legMessageRef.current = legMessage

  const clearAutoStart = useCallback((player?: 1 | 2) => {
    if (player === 1 || player === undefined) {
      if (autoStartTimersRef.current.p1 != null) window.clearTimeout(autoStartTimersRef.current.p1)
      autoStartTimersRef.current.p1 = null
    }
    if (player === 2 || player === undefined) {
      if (autoStartTimersRef.current.p2 != null) window.clearTimeout(autoStartTimersRef.current.p2)
      autoStartTimersRef.current.p2 = null
    }
  }, [])

  const clearBotTap = useCallback(() => {
    if (botTapTimerRef.current != null) window.clearTimeout(botTapTimerRef.current)
    botTapTimerRef.current = null
  }, [])

  const clearAllTimers = useCallback(() => {
    clearBotTap()
    clearAutoStart()
  }, [clearAutoStart, clearBotTap])

  const checkLegEnd = useCallback((g: SimonState) => {
    if (g.lane1.score >= POINTS_TO_WIN || g.lane2.score >= POINTS_TO_WIN) {
      endLegRef.current()
    }
  }, [])

  const endLegRef = useRef<() => void>(() => {})

  const endLeg = useCallback(() => {
    if (legEndingRef.current) return
    legEndingRef.current = true
    setLegPause(true)
    clearAllTimers()

    const g = gameRef.current
    const rw = resolveLegWinner(g.lane1, g.lane2)
    let l1 = g.lane1
    let l2 = g.lane2
    if (rw === 'p1') l1 = { ...l1, matchPoints: l1.matchPoints + 1 }
    else if (rw === 'p2') l2 = { ...l2, matchPoints: l2.matchPoints + 1 }

    playSimonDuelSound(rw === 'p1' ? 'legWin' : rw === 'p2' ? 'legLose' : 'score')

    const next: SimonState = { ...g, lane1: l1, lane2: l2 }
    gameRef.current = next
    setGame(next)

    setLegMessage(rw === 'draw' ? 'LEG BERABERE' : rw === 'p1' ? 'LEG KAZANDIN' : null)

    const matchOver =
      l1.matchPoints >= WIN_ROUNDS || l2.matchPoints >= WIN_ROUNDS || g.roundNumber >= MATCH_ROUNDS

    window.setTimeout(() => {
      if (matchOver) {
        const final =
          l1.matchPoints > l2.matchPoints ? 'p1' : l2.matchPoints > l1.matchPoints ? 'p2' : 'draw'
        setWinner(final)
        setRunning(false)
        endedRef.current = true
        playSimonDuelSound(final === 'p1' ? 'matchWin' : final === 'p2' ? 'matchLose' : 'score')
        setLegMessage(final === 'draw' ? 'MAÇ BERABERE' : final === 'p1' ? 'KAZANDIN!' : 'KAYBETTİN')
        return
      }
      const fresh = createSimonState()
      fresh.roundNumber = g.roundNumber + 1
      fresh.lane1.matchPoints = l1.matchPoints
      fresh.lane2.matchPoints = l2.matchPoints
      fresh.seqLength = Math.min(MAX_SEQ_LEN, g.seqLength + 1)
      gameRef.current = fresh
      setGame(fresh)
      legEndingRef.current = false
      setLegPause(false)
      setLegMessage(null)
    }, ROUND_BREAK_MS)
  }, [clearAllTimers])

  endLegRef.current = endLeg

  const spawnSequence = useCallback((player: 1 | 2) => {
    const g = gameRef.current
    const rand = createSimonRand()
    const recent = player === 1 ? recentP1Ref.current : recentP2Ref.current
    const sequence = generateVariedSequence(g.seqLength, rand, recent)
    rememberSequence(recent, sequence)
    return sequence
  }, [])

  const startWatch = useCallback(
    (player: 1 | 2) => {
      if (!runningRef.current || legEndingRef.current || endedRef.current || legMessageRef.current) return

      const g = gameRef.current
      const laneKey = player === 1 ? 'lane1' : 'lane2'
      const lane = g[laneKey]
      if (lane.phase !== 'ready') return

      clearAutoStart(player)

      const sequence = spawnSequence(player)
      const now = performance.now()
      const nextLane = beginWatch(lane, sequence, now)
      const next = { ...g, [laneKey]: nextLane }
      gameRef.current = next
      setGame(next)
    },
    [clearAutoStart, spawnSequence],
  )

  const scheduleAutoStart = useCallback(
    (player: 1 | 2, delayMs?: number) => {
      if (!runningRef.current || legEndingRef.current || endedRef.current || legMessageRef.current) return

      const g = gameRef.current
      const lane = player === 1 ? g.lane1 : g.lane2
      if (lane.phase !== 'ready') return

      const delay =
        delayMs ??
        (lane.lastScoreGain > 0 ? SCORE_PAUSE_MS : player === 2 ? AUTO_START_MS + 280 : AUTO_START_MS)

      clearAutoStart(player)
      const timerKey = player === 1 ? 'p1' : 'p2'
      autoStartTimersRef.current[timerKey] = window.setTimeout(() => {
        autoStartTimersRef.current[timerKey] = null
        startWatch(player)
      }, delay)
    },
    [clearAutoStart, startWatch],
  )

  const scheduleBotTap = useCallback(() => {
    clearBotTap()
    if (endedRef.current || legEndingRef.current || legMessageRef.current) return

    const g = gameRef.current
    const lane = g.lane2
    if (lane.phase !== 'input') return

    const expected = lane.sequence[lane.inputIndex]
    if (expected == null) return

    const delay = botTapDelayMs(lane.inputIndex, lane.sequence.length)
    botTapTimerRef.current = window.setTimeout(() => {
      botTapTimerRef.current = null
      const cur = gameRef.current
      const l2 = cur.lane2
      if (l2.phase !== 'input') return

      const exp = l2.sequence[l2.inputIndex]
      if (exp == null) return

      let pad: PadId = exp
      if (botMistakeChance(l2.sequence.length) > Math.random()) {
        pad = pickBotWrongPad(exp)
      }

      const now = performance.now()
      const nextLane = applyLaneTap(l2, pad, now)
      playLaneTapSounds(nextLane, pad)
      if (nextLane.lastScoreGain > 0) setP2ScorePulse((k) => k + 1)

      const next = { ...cur, lane2: nextLane }
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)

      if (next.lane2.phase === 'input') {
        scheduleBotTap()
      } else if (next.lane2.phase === 'ready') {
        scheduleAutoStart(2)
      }
    }, delay)
  }, [checkLegEnd, clearBotTap, scheduleAutoStart])

  useEffect(() => {
    if (!running || endedRef.current || legMessage) return

    const tick = () => {
      const now = performance.now()
      let g = gameRef.current
      let changed = false

      let l1 = g.lane1
      let l2 = g.lane2

      if (l1.wrongFlashUntil > 0 && now >= l1.wrongFlashUntil) {
        l1 = { ...l1, wrongFlashUntil: 0, highlightPad: l1.phase === 'input' ? l1.highlightPad : null }
        changed = true
      }
      if (l2.wrongFlashUntil > 0 && now >= l2.wrongFlashUntil) {
        l2 = { ...l2, wrongFlashUntil: 0, highlightPad: l2.phase === 'input' ? l2.highlightPad : null }
        changed = true
      }

      const advanced1 = advanceLaneShow(l1, now)
      const advanced2 = advanceLaneShow(l2, now)
      if (advanced1 !== l1) {
        l1 = advanced1
        changed = true
      }
      if (advanced2 !== l2) {
        l2 = advanced2
        changed = true
      }

      if (changed) {
        g = { ...g, lane1: l1, lane2: l2 }
        gameRef.current = g
        setGame(g)
      }

      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current != null) window.cancelAnimationFrame(loopRef.current)
    }
  }, [legMessage, running])

  useEffect(() => {
    const l1 = game.lane1
    if (l1.phase === 'show' && l1.showBeat === 'lit' && l1.showPad != null) {
      const key = `${l1.showIndex}-${l1.showPad}`
      if (showSoundRef.current.p1 !== key) {
        showSoundRef.current.p1 = key
        playSimonPadSound(l1.showPad)
      }
    } else if (l1.phase !== 'show') {
      showSoundRef.current.p1 = ''
    }
  }, [game.lane1.phase, game.lane1.showBeat, game.lane1.showPad, game.lane1.showIndex])

  useEffect(() => {
    const l2 = game.lane2
    if (l2.phase === 'show' && l2.showBeat === 'lit' && l2.showPad != null) {
      const key = `${l2.showIndex}-${l2.showPad}`
      if (showSoundRef.current.p2 !== key) {
        showSoundRef.current.p2 = key
        playSimonPadSound(l2.showPad)
      }
    } else if (l2.phase !== 'show') {
      showSoundRef.current.p2 = ''
    }
  }, [game.lane2.phase, game.lane2.showBeat, game.lane2.showPad, game.lane2.showIndex])

  useEffect(() => {
    if (!running || legMessage || endedRef.current) return
    if (!startedRef.current) {
      startedRef.current = true
      unlockSimonDuelAudio()
      playSimonDuelSound('start')
    }
    if (game.lane1.phase === 'ready') scheduleAutoStart(1)
    if (game.lane2.phase === 'ready') scheduleAutoStart(2)
  }, [game.lane1.phase, game.lane1.lastScoreGain, game.lane2.phase, game.lane2.lastScoreGain, legMessage, running, scheduleAutoStart])

  useEffect(() => {
    if (game.lane2.phase === 'input') {
      scheduleBotTap()
    } else {
      clearBotTap()
    }
    return () => clearBotTap()
  }, [game.lane2.phase, game.lane2.inputIndex, game.lane2.sequence.length, scheduleBotTap, clearBotTap])

  const tapP1 = useCallback(
    (pad: PadId) => {
      if (!running || legEndingRef.current || endedRef.current || legMessageRef.current) return
      unlockSimonDuelAudio()

      const g = gameRef.current
      if (g.lane1.phase !== 'input') return

      clearAutoStart(1)
      const nextLane = applyLaneTap(g.lane1, pad, performance.now())
      playLaneTapSounds(nextLane, pad)
      if (nextLane.lastScoreGain > 0) setP1ScorePulse((k) => k + 1)

      const next = { ...g, lane1: nextLane }
      gameRef.current = next
      setGame(next)
      checkLegEnd(next)

      if (next.lane1.phase === 'ready') {
        scheduleAutoStart(1)
      }
    },
    [checkLegEnd, running, clearAutoStart, scheduleAutoStart],
  )

  const restartMatch = useCallback(() => {
    clearAllTimers()
    endedRef.current = false
    legEndingRef.current = false
    startedRef.current = false
    showSoundRef.current = { p1: '', p2: '' }
    recentP1Ref.current.clear()
    recentP2Ref.current.clear()
    const fresh = createSimonState()
    gameRef.current = fresh
    setGame(fresh)
    setLegMessage(null)
    setLegPause(false)
    setWinner(null)
    setP1ScorePulse(0)
    setP2ScorePulse(0)
    setRunning(true)
  }, [clearAllTimers])

  return {
    game,
    legMessage,
    legPause,
    running,
    winner,
    matchRounds: MATCH_ROUNDS,
    pointsToWin: POINTS_TO_WIN,
    p1ScorePulse,
    p2ScorePulse,
    tapP1,
    restartMatch,
  }
}
