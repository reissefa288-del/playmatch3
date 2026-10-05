import { useEffect, useRef } from 'react'

/** Single requestAnimationFrame loop — stops when `active` is false. */
export function useRafLoop(active: boolean, tick: (now: number, dtMs: number) => void) {
  const tickRef = useRef(tick)
  tickRef.current = tick

  useEffect(() => {
    if (!active) return

    let raf = 0
    let prev = performance.now()

    const frame = (now: number) => {
      const dtMs = now - prev
      prev = now
      tickRef.current(now, dtMs)
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
