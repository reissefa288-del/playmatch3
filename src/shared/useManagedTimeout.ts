import { useCallback, useEffect, useRef } from 'react'

/** Tracks a single timeout with automatic cleanup on unmount. */
export function useManagedTimeout() {
  const timerRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      clear()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        fn()
      }, ms)
    },
    [clear],
  )

  useEffect(() => () => clear(), [clear])

  return { schedule, clear }
}
