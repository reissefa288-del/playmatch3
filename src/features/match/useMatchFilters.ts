import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_MATCH_FILTERS } from './matchFilters'
import type { MatchFilters } from './types'

const STORAGE_KEY = 'pm-match-filters'

function readStored(): MatchFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MATCH_FILTERS
    const parsed = JSON.parse(raw) as Partial<MatchFilters>
    const gender = parsed.gender === 'male' || parsed.gender === 'female' ? parsed.gender : 'female'
    return { gender }
  } catch {
    return DEFAULT_MATCH_FILTERS
  }
}

export function useMatchFilters() {
  const [applied, setApplied] = useState<MatchFilters>(readStored)
  const [draft, setDraft] = useState<MatchFilters>(applied)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) setDraft(applied)
  }, [open, applied])

  const openSheet = useCallback(() => setOpen(true), [])
  const closeSheet = useCallback(() => setOpen(false), [])

  const patchDraft = useCallback((patch: Partial<MatchFilters>) => {
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
    setDraft(DEFAULT_MATCH_FILTERS)
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
  }
}
