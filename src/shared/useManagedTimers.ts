import { useCallback, useEffect, useRef } from 'react'

/** Tracks multiple timeouts with automatic cleanup on unmount. */
export function useManagedTimers() {
  const idsRef = useRef<Set<number>>(new Set())

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      idsRef.current.delete(id)
      fn()
    }, ms)
    idsRef.current.add(id)
    return id
  }, [])

  const clear = useCallback((id: number) => {
    window.clearTimeout(id)
    idsRef.current.delete(id)
  }, [])

  const clearAll = useCallback(() => {
    idsRef.current.forEach((id) => window.clearTimeout(id))
    idsRef.current.clear()
  }, [])

  useEffect(() => () => clearAll(), [clearAll])

  return { schedule, clear, clearAll }
}
