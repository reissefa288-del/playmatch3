import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { recordProfileLikeSent } from '../profile/profileStats'

const LIKES_STORAGE_KEY = 'pm-nearby-likes'
const INVITES_STORAGE_KEY = 'pm-nearby-game-invites'

type NearbyLikesActions = {
  sendLike: (id: string) => void
  sendInvite: (id: string) => void
}

const NearbyLikesActionsContext = createContext<NearbyLikesActions | null>(null)

let likedIds = readIdSet(LIKES_STORAGE_KEY)
let invitedIds = readIdSet(INVITES_STORAGE_KEY)
const listeners = new Set<() => void>()

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

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getLikedSnapshot() {
  return [...likedIds].sort().join('|')
}

function getInvitedSnapshot() {
  return [...invitedIds].sort().join('|')
}

function getCombinedSnapshot() {
  return `${getLikedSnapshot()}::${getInvitedSnapshot()}`
}

export function NearbyLikesProvider({ children }: { children: ReactNode }) {
  const sendLike = useCallback((id: string) => {
    if (likedIds.has(id)) return
    likedIds = new Set(likedIds)
    likedIds.add(id)
    persistIdSet(LIKES_STORAGE_KEY, likedIds)
    recordProfileLikeSent()
    emit()
  }, [])

  const sendInvite = useCallback((id: string) => {
    if (invitedIds.has(id)) return
    invitedIds = new Set(invitedIds)
    invitedIds.add(id)
    persistIdSet(INVITES_STORAGE_KEY, invitedIds)
    emit()
  }, [])

  const actions = useMemo(() => ({ sendLike, sendInvite }), [sendLike, sendInvite])

  return <NearbyLikesActionsContext.Provider value={actions}>{children}</NearbyLikesActionsContext.Provider>
}

export function useNearbyLikesActions() {
  const ctx = useContext(NearbyLikesActionsContext)
  if (!ctx) throw new Error('useNearbyLikesActions must be used within NearbyLikesProvider')
  return ctx
}

export function useHasLiked(id: string) {
  const snapshot = useSyncExternalStore(subscribe, getLikedSnapshot, getLikedSnapshot)
  void snapshot
  return likedIds.has(id)
}

export function useHasInvited(id: string) {
  const snapshot = useSyncExternalStore(subscribe, getInvitedSnapshot, getInvitedSnapshot)
  void snapshot
  return invitedIds.has(id)
}

export function useNearbyLikesRevision() {
  return useSyncExternalStore(subscribe, getLikedSnapshot, getLikedSnapshot)
}

export function isNearbyPlayerLiked(id: string) {
  return likedIds.has(id)
}

/** @deprecated Prefer useHasLiked / useNearbyLikesActions for fewer rerenders. */
export function useNearbyLikes() {
  useSyncExternalStore(subscribe, getCombinedSnapshot, getCombinedSnapshot)
  const { sendLike, sendInvite } = useNearbyLikesActions()
  return {
    hasLiked: (playerId: string) => likedIds.has(playerId),
    hasInvited: (playerId: string) => invitedIds.has(playerId),
    sendLike,
    sendInvite,
  }
}
