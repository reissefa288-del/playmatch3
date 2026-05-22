import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'pm-match-boost-until'

export const BOOST_GEM_COST = 35
export const BOOST_DURATION_MS = 45 * 60 * 1000

function readBoostUntil(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const until = Number(raw)
    if (!Number.isFinite(until) || until <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return until
  } catch {
    return null
  }
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function useMatchBoost() {
  const [boostUntil, setBoostUntil] = useState<number | null>(readBoostUntil)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!boostUntil) return
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(tick)
  }, [boostUntil])

  useEffect(() => {
    if (boostUntil && boostUntil <= now) {
      setBoostUntil(null)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
    }
  }, [boostUntil, now])

  const isActive = boostUntil != null && boostUntil > now
  const remainingMs = isActive && boostUntil ? boostUntil - now : 0
  const progress = isActive ? Math.max(0, Math.min(1, remainingMs / BOOST_DURATION_MS)) : 0

  const activate = useCallback(() => {
    const until = Date.now() + BOOST_DURATION_MS
    setBoostUntil(until)
    try {
      localStorage.setItem(STORAGE_KEY, String(until))
    } catch {
      /* ignore */
    }
  }, [])

  return {
    isActive,
    remainingMs,
    remainingLabel: formatRemaining(remainingMs),
    progress,
    activate,
    cost: BOOST_GEM_COST,
    durationMinutes: 45,
  }
}
