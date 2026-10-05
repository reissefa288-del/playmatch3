import { useSyncExternalStore } from 'react'
import {
  getMatchConnectionsSnapshot,
  subscribeMatchConnections,
} from './matchConnectionsStore'

export function useMatchConnections() {
  const snapshot = useSyncExternalStore(
    subscribeMatchConnections,
    getMatchConnectionsSnapshot,
    getMatchConnectionsSnapshot,
  )

  return {
    matches: snapshot.matches,
    matchCount: snapshot.matches.length,
    likedUids: snapshot.likedUids,
    loading: snapshot.loading,
    error: snapshot.error,
    hasLiked: (uid: string) => snapshot.likedUids.has(uid),
  }
}
