import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'pm-matched-game-invites'

type GameMatchedInvitesContextValue = {
  hasInvited: (id: string) => boolean
  sendInvite: (id: string) => void
}

const GameMatchedInvitesContext = createContext<GameMatchedInvitesContextValue | null>(null)

function readIdSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function persistIdSet(next: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    /* ignore */
  }
}

export function GameMatchedInvitesProvider({ children }: { children: ReactNode }) {
  const [invited, setInvited] = useState<Set<string>>(() => readIdSet())

  const hasInvited = useCallback((id: string) => invited.has(id), [invited])

  const sendInvite = useCallback((id: string) => {
    setInvited((prev) => {
      const next = new Set(prev)
      next.add(id)
      persistIdSet(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ hasInvited, sendInvite }), [hasInvited, sendInvite])

  return (
    <GameMatchedInvitesContext.Provider value={value}>{children}</GameMatchedInvitesContext.Provider>
  )
}

export function useGameMatchedInvites() {
  const ctx = useContext(GameMatchedInvitesContext)
  if (!ctx) {
    throw new Error('useGameMatchedInvites must be used within GameMatchedInvitesProvider')
  }
  return ctx
}
