import { useCallback, useEffect, useRef, useState } from 'react'

export type DuelRematchPhase = 'idle' | 'waiting' | 'declined'

const DEFAULT_ACCEPT_CHANCE = 0.84
const DEFAULT_DELAY_MS: [number, number] = [1600, 4200]

function randomDelay([min, max]: [number, number]) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

type Options = {
  onRestart: () => void
  opponentAcceptChance?: number
  opponentDelayMs?: [number, number]
}

export function useDuelRematch({
  onRestart,
  opponentAcceptChance = DEFAULT_ACCEPT_CHANCE,
  opponentDelayMs = DEFAULT_DELAY_MS,
}: Options) {
  const [phase, setPhase] = useState<DuelRematchPhase>('idle')
  const timerRef = useRef<number | null>(null)
  const onRestartRef = useRef(onRestart)

  onRestartRef.current = onRestart

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setPhase('idle')
  }, [clearTimer])

  const requestRematch = useCallback(() => {
    clearTimer()
    setPhase('waiting')

    const delay = randomDelay(opponentDelayMs)
    const opponentAccepts = Math.random() < opponentAcceptChance

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      if (opponentAccepts) {
        setPhase('idle')
        onRestartRef.current()
      } else {
        setPhase('declined')
      }
    }, delay)
  }, [clearTimer, opponentAcceptChance, opponentDelayMs])

  const cancelWaiting = useCallback(() => {
    clearTimer()
    setPhase('idle')
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  return {
    phase,
    isWaiting: phase === 'waiting',
    isDeclined: phase === 'declined',
    requestRematch,
    cancelWaiting,
    reset,
  }
}
