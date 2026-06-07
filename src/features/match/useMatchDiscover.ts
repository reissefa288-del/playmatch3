import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDailyLikes } from '../likes/useDailyLikes'
import { DAILY_LIKES_LIMIT, matchDiscoverProfiles } from './data'
import { filterMatchProfiles } from './filterMatchProfiles'
import type { MatchDiscoverActions, MatchDiscoverState, MatchToastPayload } from './matchDiscoverTypes'
import type { MatchGenderFilter } from './types'

export type { MatchToastPayload } from './matchDiscoverTypes'

export type DiscoverAction = 'like' | 'pass' | 'super' | 'invite'

type HistoryEntry = {
  profileId: string
  action: DiscoverAction
  consumedLike: boolean
}

export function useMatchDiscover(gender: MatchGenderFilter) {
  const pool = useMemo(() => filterMatchProfiles(matchDiscoverProfiles, gender), [gender])
  const { remaining, isUnlimited, tryConsumeLike } = useDailyLikes()

  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [toast, setToast] = useState<MatchToastPayload | null>(null)
  const toastId = useRef(0)
  const prevGender = useRef(gender)

  useEffect(() => {
    if (prevGender.current === gender) return
    prevGender.current = gender
    setIndex(0)
    setHistory([])
    setToast(null)
  }, [gender])

  const current = pool[index] ?? null
  const peekLeft = index > 0 ? pool[index - 1]! : null
  const peekRight = index < pool.length - 1 ? pool[index + 1]! : null
  const queueDone = pool.length === 0 || index >= pool.length

  const dismissToast = useCallback(() => setToast(null), [])

  const showToast = useCallback(
    (title: string, variant: MatchToastPayload['variant'], subtitle?: string) => {
      toastId.current += 1
      setToast({ id: toastId.current, title, subtitle, variant })
    },
    [],
  )

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  const advance = useCallback((entry: HistoryEntry) => {
    setHistory((h) => [...h, entry])
    setIndex((i) => i + 1)
  }, [])

  const pass = useCallback(() => {
    if (!current) return
    advance({ profileId: current.id, action: 'pass', consumedLike: false })
  }, [advance, current])

  const like = useCallback(() => {
    if (!current) return
    if (!isUnlimited && remaining <= 0) {
      showToast(
        'Beğeni hakkın bitti',
        'warn',
        `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak · Premium ile sınırsız`,
      )
      return
    }
    if (!tryConsumeLike()) return
    advance({ profileId: current.id, action: 'like', consumedLike: true })
  }, [advance, current, isUnlimited, remaining, showToast, tryConsumeLike])

  const superLike = useCallback(() => {
    if (!current) return
    advance({ profileId: current.id, action: 'super', consumedLike: false })
    showToast('Premium beğeni gönderildi', 'premium', `${current.name} profiline öne çıktın`)
  }, [advance, current, showToast])

  const gameInvite = useCallback(() => {
    if (!current) return
    advance({ profileId: current.id, action: 'invite', consumedLike: false })
    showToast('Oyun daveti gönderildi', 'invite', `${current.name} lobine davet edildi`)
  }, [advance, current, showToast])

  const undo = useCallback(() => {
    const last = history[history.length - 1]
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    setIndex((i) => Math.max(0, i - 1))
    setToast(null)
  }, [history])

  const canUndo = history.length > 0
  const canLike = Boolean(current) && (isUnlimited || remaining > 0)
  const canAct = Boolean(current) && !queueDone

  const state = useMemo<MatchDiscoverState>(
    () => ({
      current,
      peekLeft,
      peekRight,
      queueDone,
      poolSize: pool.length,
      likesRemaining: remaining,
      dailyLimit: DAILY_LIKES_LIMIT,
      isUnlimited,
      toast,
      canUndo,
      canLike,
      canAct,
    }),
    [
      canAct,
      canLike,
      canUndo,
      current,
      isUnlimited,
      peekLeft,
      peekRight,
      pool.length,
      queueDone,
      remaining,
      toast,
    ],
  )

  const actions = useMemo<MatchDiscoverActions>(
    () => ({
      dismissToast,
      pass,
      like,
      superLike,
      gameInvite,
      undo,
      notify: showToast,
    }),
    [dismissToast, gameInvite, like, pass, showToast, superLike, undo],
  )

  return { state, actions }
}
