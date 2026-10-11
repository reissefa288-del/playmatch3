import { useCallback, useState } from 'react'
import { DEFAULT_HOME_FILTERS } from './homeFilters'
import type { HomeFilters } from './types'

const STORAGE_KEY = 'pm-home-filters'

function readStored(): HomeFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_HOME_FILTERS
    return { ...DEFAULT_HOME_FILTERS, ...JSON.parse(raw) } as HomeFilters
  } catch {
    return DEFAULT_HOME_FILTERS
  }
}

export function useHomeFilters() {
  const [applied, setApplied] = useState<HomeFilters>(readStored)

  const toggleOnlineQuick = useCallback(() => {
    setApplied((prev) => {
      const next = { ...prev, onlineOnly: !prev.onlineOnly }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const applyQuick = useCallback((patch: Partial<HomeFilters>) => {
    setApplied((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return {
    applied,
    toggleOnlineQuick,
    applyQuick,
  }
}

export type HomeFiltersController = ReturnType<typeof useHomeFilters>
