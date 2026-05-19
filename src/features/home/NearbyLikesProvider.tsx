import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'pm-nearby-likes'

type NearbyLikesContextValue = {
  hasLiked: (id: string) => boolean
  sendLike: (id: string) => void
}

const NearbyLikesContext = createContext<NearbyLikesContextValue | null>(null)

function readLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function NearbyLikesProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(readLikes)

  const hasLiked = useCallback((id: string) => liked.has(id), [liked])

  const sendLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ hasLiked, sendLike }), [hasLiked, sendLike])

  return <NearbyLikesContext.Provider value={value}>{children}</NearbyLikesContext.Provider>
}

export function useNearbyLikes() {
  const ctx = useContext(NearbyLikesContext)
  if (!ctx) {
    throw new Error('useNearbyLikes must be used within NearbyLikesProvider')
  }
  return ctx
}
