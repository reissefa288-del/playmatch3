import { useCallback, useEffect, useRef, useState } from 'react'

const ACTIVE_MIN = 210
const ACTIVE_MAX = 398
const WAITING_MAX = 12
const TICK_MS = 4000

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function nextActiveCount(prev: number) {
  const hour = new Date().getHours()
  const peak = hour >= 18 && hour <= 23 ? 1.4 : hour >= 12 ? 1.15 : 0.9
  const drift = Math.round((Math.random() * 9 - 4) * peak)
  return clamp(prev + drift, ACTIVE_MIN, ACTIVE_MAX)
}

function nextWaitingCount(prev: number) {
  const roll = Math.random()
  if (roll < 0.12) return clamp(prev + 2, 0, WAITING_MAX)
  if (roll < 0.28) return clamp(prev + 1, 0, WAITING_MAX)
  if (roll < 0.55) return clamp(prev - 1, 0, WAITING_MAX)
  return prev
}

const TICKER_MESSAGES = [
  'Ece Block Duel oynuyor',
  'Mert Puzzle oynuyor',
  'Azra Block Duel oynuyor',
  'Yeni eşleşme isteği geldi',
  '247 oyuncu lobide',
  'Damla seni bekliyor',
]

export function useLiveSocialStats() {
  const [activeCount, setActiveCount] = useState(234)
  const [waitingCount, setWaitingCount] = useState(3)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [activeFlash, setActiveFlash] = useState(false)
  const [waitFlash, setWaitFlash] = useState(false)
  const [waitPulseFast, setWaitPulseFast] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback((which: 'active' | 'wait', fastPulse = false) => {
    if (which === 'active') setActiveFlash(true)
    else {
      setWaitFlash(true)
      if (fastPulse) setWaitPulseFast(true)
    }
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => {
      setActiveFlash(false)
      setWaitFlash(false)
      setWaitPulseFast(false)
    }, 520)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveCount((prev) => {
        const next = nextActiveCount(prev)
        if (next !== prev) flash('active')
        return next
      })
      setWaitingCount((prev) => {
        const next = nextWaitingCount(prev)
        if (next !== prev) flash('wait', next > prev)
        return next
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [flash])

  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % TICKER_MESSAGES.length)
    }, 5500)
    return () => clearInterval(id)
  }, [])

  return {
    activePlayersLabel: `${activeCount} oyuncu aktif`,
    waitLabel:
      waitingCount === 0
        ? 'Kimse beklemiyor'
        : `${waitingCount} kişi seni bekliyor`,
    tickerLine: TICKER_MESSAGES[tickerIndex],
    activeFlash,
    waitFlash,
    waitPulseFast,
  }
}
