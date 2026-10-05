import { useEffect, useRef } from 'react'

/** setInterval that runs only while `active` — pauses on hidden tab / inactive dock tab. */
export function useIntervalWhenActive(active: boolean, fn: () => void, ms: number) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => fnRef.current(), ms)
    return () => window.clearInterval(id)
  }, [active, ms])
}
