import { useCallback, useEffect, useRef, useState } from 'react'
import { DAILY_LIKES_LIMIT, matchDiscoverProfiles } from './data'

export type DiscoverAction = 'like' | 'pass' | 'super' | 'invite'

type HistoryEntry = {
  profileId: string
  action: DiscoverAction
  consumedLike: boolean
}

export type MatchToastPayload = {
  id: number
  title: string
  subtitle?: string
  variant: 'premium' | 'invite' | 'warn' | 'success'
}

export function useMatchDiscover() {
  const [index, setIndex] = useState(0)
  const [likesRemaining, setLikesRemaining] = useState(DAILY_LIKES_LIMIT)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [toast, setToast] = useState<MatchToastPayload | null>(null)
  const toastId = useRef(0)

  const current = matchDiscoverProfiles[index] ?? null
  const peekLeft = index > 0 ? matchDiscoverProfiles[index - 1]! : null
  const peekRight =
    index < matchDiscoverProfiles.length - 1 ? matchDiscoverProfiles[index + 1]! : null
  const queueDone = index >= matchDiscoverProfiles.length

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

  const advance = useCallback(
    (entry: HistoryEntry) => {
      setHistory((h) => [...h, entry])
      setIndex((i) => i + 1)
    },
    [],
  )

  const pass = useCallback(() => {
    if (!current) return
    advance({ profileId: current.id, action: 'pass', consumedLike: false })
  }, [advance, current])

  const like = useCallback(() => {
    if (!current) return
    if (likesRemaining <= 0) {
      showToast('Beğeni hakkın bitti', 'warn', 'Yarın 15 yeni hak tanımlanacak')
      return
    }
    setLikesRemaining((n) => n - 1)
    advance({ profileId: current.id, action: 'like', consumedLike: true })
  }, [advance, current, likesRemaining, showToast])

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
    if (last.consumedLike) setLikesRemaining((n) => Math.min(DAILY_LIKES_LIMIT, n + 1))
    setHistory((h) => h.slice(0, -1))
    setIndex((i) => Math.max(0, i - 1))
    setToast(null)
  }, [history])

  const canUndo = history.length > 0
  const canLike = Boolean(current) && likesRemaining > 0
  const canAct = Boolean(current) && !queueDone

  return {
    current,
    peekLeft,
    peekRight,
    queueDone,
    likesRemaining,
    dailyLimit: DAILY_LIKES_LIMIT,
    toast,
    dismissToast,
    pass,
    like,
    superLike,
    gameInvite,
    undo,
    canUndo,
    canLike,
    canAct,
  }
}
