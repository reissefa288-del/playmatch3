import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { useDailyLikes } from '../likes/useDailyLikes'
import { DAILY_LIKES_LIMIT } from './data'
import { fetchDiscoverProfilesPage, type DiscoverPageCursor } from './firestoreMatch'
import { DISCOVER_PREFETCH_THRESHOLD } from './discoverConstants'
import { sendLikeAndRefresh } from './matchConnectionsStore'
import type { MatchDiscoverActions, MatchDiscoverState, MatchToastPayload } from './matchDiscoverTypes'
import type { MatchProfile } from './data'
import type { MatchGenderFilter } from './types'

export type { MatchToastPayload } from './matchDiscoverTypes'

export type DiscoverAction = 'like' | 'pass' | 'super' | 'invite'

type HistoryEntry = {
  profileId: string
  action: DiscoverAction
  consumedLike: boolean
}

export function useMatchDiscover(gender: MatchGenderFilter) {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null
  const { remaining, isUnlimited, tryConsumeLike } = useDailyLikes()

  const [pool, setPool] = useState<MatchProfile[]>([])
  const [poolLoading, setPoolLoading] = useState(true)
  const [cursor, setCursor] = useState<DiscoverPageCursor>(null)
  const [hasMore, setHasMore] = useState(true)
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [toast, setToast] = useState<MatchToastPayload | null>(null)
  const [acting, setActing] = useState(false)
  const toastId = useRef(0)
  const prevGender = useRef(gender)
  const loadGen = useRef(0)
  const prefetching = useRef(false)

  useEffect(() => {
    if (prevGender.current === gender) return
    prevGender.current = gender
    setIndex(0)
    setHistory([])
    setToast(null)
    setCursor(null)
    setHasMore(true)
  }, [gender])

  useEffect(() => {
    if (!uid) {
      setPool([])
      setPoolLoading(false)
      setCursor(null)
      setHasMore(false)
      return
    }

    const generation = ++loadGen.current
    setPoolLoading(true)
    setCursor(null)
    setHasMore(true)

    void fetchDiscoverProfilesPage(uid, gender, null)
      .then((page) => {
        if (generation !== loadGen.current) return
        setPool(page.profiles)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
        setIndex(0)
        setHistory([])
      })
      .finally(() => {
        if (generation !== loadGen.current) return
        setPoolLoading(false)
      })
  }, [uid, gender])

  useEffect(() => {
    if (!uid || poolLoading || !hasMore || prefetching.current) return
    if (pool.length - index > DISCOVER_PREFETCH_THRESHOLD) return

    prefetching.current = true
    const generation = loadGen.current

    void fetchDiscoverProfilesPage(uid, gender, cursor)
      .then((page) => {
        if (generation !== loadGen.current) return
        if (page.profiles.length === 0) {
          setHasMore(page.hasMore)
          return
        }
        setPool((current) => {
          const seen = new Set(current.map((profile) => profile.id))
          const next = page.profiles.filter((profile) => !seen.has(profile.id))
          return next.length > 0 ? [...current, ...next] : current
        })
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      })
      .finally(() => {
        prefetching.current = false
      })
  }, [cursor, gender, hasMore, index, pool.length, poolLoading, uid])

  const current = pool[index] ?? null
  const peekLeft = index > 0 ? pool[index - 1]! : null
  const peekRight = index < pool.length - 1 ? pool[index + 1]! : null
  const queueDone = !poolLoading && (pool.length === 0 || index >= pool.length)

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
    if (!current || acting) return
    advance({ profileId: current.id, action: 'pass', consumedLike: false })
  }, [acting, advance, current])

  const like = useCallback(() => {
    if (!current || acting || !uid) return
    if (!isUnlimited && remaining <= 0) {
      showToast(
        'Beğeni hakkın bitti',
        'warn',
        `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak · Premium ile sınırsız`,
      )
      return
    }

    setActing(true)
    void (async () => {
      if (!(await tryConsumeLike())) {
        showToast('Beğeni hakkın bitti', 'warn', `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak`)
        setActing(false)
        return
      }

      try {
        const result = await sendLikeAndRefresh(uid, current.id, 'discover')
        advance({ profileId: current.id, action: 'like', consumedLike: true })
        if (result.matched) {
          showToast('Eşleşme!', 'premium', `${current.name} ile eşleştiniz`)
        }
      } catch {
        showToast('Beğeni gönderilemedi', 'warn', 'Bağlantını kontrol edip tekrar dene.')
      } finally {
        setActing(false)
      }
    })()
  }, [
    acting,
    advance,
    current,
    isUnlimited,
    remaining,
    showToast,
    tryConsumeLike,
    uid,
  ])

  const superLike = useCallback(() => {
    if (!current || acting) return
    advance({ profileId: current.id, action: 'super', consumedLike: false })
    showToast('Premium beğeni gönderildi', 'premium', `${current.name} profiline öne çıktın`)
  }, [acting, advance, current, showToast])

  const gameInvite = useCallback(() => {
    if (!current || acting) return
    advance({ profileId: current.id, action: 'invite', consumedLike: false })
    showToast('Oyun daveti gönderildi', 'invite', `${current.name} lobine davet edildi`)
  }, [acting, advance, current, showToast])

  const undo = useCallback(() => {
    const last = history[history.length - 1]
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    setIndex((i) => Math.max(0, i - 1))
    setToast(null)
  }, [history])

  const canUndo = history.length > 0
  const canLike = Boolean(current) && (isUnlimited || remaining > 0) && !acting
  const canAct = Boolean(current) && !queueDone && !acting && !poolLoading

  const state = useMemo<MatchDiscoverState>(
    () => ({
      current,
      peekLeft,
      peekRight,
      queueDone,
      poolSize: poolLoading ? 0 : pool.length,
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
      poolLoading,
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
