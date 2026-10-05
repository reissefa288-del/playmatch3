import { useEffect, useRef } from 'react'

/** rAF tabanlı interval — görünürken çalışır, setInterval yerine ana thread ile senkron. */
export function useRafIntervalWhenActive(active: boolean, fn: () => void, intervalMs: number) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!active) return

    let raf = 0
    let lastTick = performance.now()

    const frame = (now: number) => {
      if (now - lastTick >= intervalMs) {
        lastTick = now
        fnRef.current()
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active, intervalMs])
}
