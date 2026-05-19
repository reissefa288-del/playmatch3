import { useCallback, useEffect, useState } from 'react'
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
  const [draft, setDraft] = useState<HomeFilters>(applied)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) setDraft(applied)
  }, [open, applied])

  const openSheet = useCallback(() => setOpen(true), [])
  const closeSheet = useCallback(() => setOpen(false), [])

  const patchDraft = useCallback((patch: Partial<HomeFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const applyDraft = useCallback(() => {
    setApplied(draft)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
    setOpen(false)
  }, [draft])

  const resetDraft = useCallback(() => {
    setDraft(DEFAULT_HOME_FILTERS)
  }, [])

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

  return {
    applied,
    draft,
    open,
    openSheet,
    closeSheet,
    patchDraft,
    applyDraft,
    resetDraft,
    toggleOnlineQuick,
  }
}
