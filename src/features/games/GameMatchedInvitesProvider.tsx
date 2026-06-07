import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'pm-matched-game-invites'

type GameMatchedInvitesActions = {
  sendInvite: (id: string) => void
}

const GameMatchedInvitesActionsContext = createContext<GameMatchedInvitesActions | null>(null)

let invitedIds = readIdSet()
const listeners = new Set<() => void>()

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

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return [...invitedIds].sort().join('|')
}

export function GameMatchedInvitesProvider({ children }: { children: ReactNode }) {
  const sendInvite = useCallback((id: string) => {
    if (invitedIds.has(id)) return
    invitedIds = new Set(invitedIds)
    invitedIds.add(id)
    persistIdSet(invitedIds)
    emit()
  }, [])

  const actions = useMemo(() => ({ sendInvite }), [sendInvite])

  return (
    <GameMatchedInvitesActionsContext.Provider value={actions}>
      {children}
    </GameMatchedInvitesActionsContext.Provider>
  )
}

export function useGameMatchedInvitesActions() {
  const ctx = useContext(GameMatchedInvitesActionsContext)
  if (!ctx) {
    throw new Error('useGameMatchedInvitesActions must be used within GameMatchedInvitesProvider')
  }
  return ctx
}

export function useHasGameMatchedInvite(id: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  void snapshot
  return invitedIds.has(id)
}

/** @deprecated Prefer useHasGameMatchedInvite / useGameMatchedInvitesActions for fewer rerenders. */
export function useGameMatchedInvites() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const { sendInvite } = useGameMatchedInvitesActions()
  return {
    hasInvited: (playerId: string) => invitedIds.has(playerId),
    sendInvite,
  }
}
