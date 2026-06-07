import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const LIKES_STORAGE_KEY = 'pm-nearby-likes'
const INVITES_STORAGE_KEY = 'pm-nearby-game-invites'

type NearbyLikesContextValue = {
  hasLiked: (id: string) => boolean
  sendLike: (id: string) => void
  hasInvited: (id: string) => boolean
  sendInvite: (id: string) => void
}

const NearbyLikesContext = createContext<NearbyLikesContextValue | null>(null)

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function persistIdSet(key: string, next: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...next]))
  } catch {
    /* ignore */
  }
}

export function NearbyLikesProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(() => readIdSet(LIKES_STORAGE_KEY))
  const [invited, setInvited] = useState<Set<string>>(() => readIdSet(INVITES_STORAGE_KEY))

  const hasLiked = useCallback((id: string) => liked.has(id), [liked])
  const hasInvited = useCallback((id: string) => invited.has(id), [invited])

  const sendLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      next.add(id)
      persistIdSet(LIKES_STORAGE_KEY, next)
      return next
    })
  }, [])

  const sendInvite = useCallback((id: string) => {
    setInvited((prev) => {
      const next = new Set(prev)
      next.add(id)
      persistIdSet(INVITES_STORAGE_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ hasLiked, sendLike, hasInvited, sendInvite }),
    [hasLiked, sendLike, hasInvited, sendInvite],
  )

  return <NearbyLikesContext.Provider value={value}>{children}</NearbyLikesContext.Provider>
}

export function useNearbyLikes() {
  const ctx = useContext(NearbyLikesContext)
  if (!ctx) {
    throw new Error('useNearbyLikes must be used within NearbyLikesProvider')
  }
  return ctx
}
