import { useEffect, useSyncExternalStore } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { useMatchConnections } from '../match/useMatchConnections'
import { bindChatThreads, getChatThreadsSnapshot, subscribeChatThreads } from './chatThreadsStore'

export function useChatThreads() {
  const { session } = useAuthSession()
  const { matches, loading: matchesLoading } = useMatchConnections()
  const snapshot = useSyncExternalStore(subscribeChatThreads, getChatThreadsSnapshot, getChatThreadsSnapshot)

  useEffect(() => {
    bindChatThreads(session?.uid ?? null, matches)
  }, [session?.uid, matches])

  return {
    threads: snapshot.threads,
    loading: matchesLoading || snapshot.loading,
  }
}
