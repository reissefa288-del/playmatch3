import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { bindChatThreads, getChatThreadsSnapshot, subscribeChatThreads } from '../chat/chatThreadsStore'
import { getMatchConnectionsSnapshot, subscribeMatchConnections } from '../match/matchConnectionsStore'
import { useMatchConnections } from '../match/useMatchConnections'
import {
  buildProfileStatStripItems,
  formatProfileStatCount,
  getProfileStatsSnapshot,
  subscribeProfileStats,
  type ProfileDisplayStats,
} from './profileStats'

type ProfileStatsContextValue = ProfileDisplayStats & {
  statStrip: ReturnType<typeof buildProfileStatStripItems>
  likesFormatted: string
  visitsFormatted: string
}

const ProfileStatsContext = createContext<ProfileStatsContextValue | null>(null)

export function ProfileStatsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthSession()
  const { matches } = useMatchConnections()

  useEffect(() => {
    bindChatThreads(session?.uid ?? null, matches)
  }, [session?.uid, matches])

  const persisted = useSyncExternalStore(subscribeProfileStats, getProfileStatsSnapshot, getProfileStatsSnapshot)
  const matchSnapshot = useSyncExternalStore(
    subscribeMatchConnections,
    getMatchConnectionsSnapshot,
    getMatchConnectionsSnapshot,
  )
  const chatSnapshot = useSyncExternalStore(subscribeChatThreads, getChatThreadsSnapshot, getChatThreadsSnapshot)

  const value = useMemo<ProfileStatsContextValue>(() => {
    const display: ProfileDisplayStats = {
      friends: chatSnapshot.threads.length,
      likes: persisted.likesSent,
      visits: persisted.profileVisits,
      matches: matchSnapshot.matches.length,
    }

    return {
      ...display,
      statStrip: buildProfileStatStripItems(display),
      likesFormatted: formatProfileStatCount(display.likes),
      visitsFormatted: formatProfileStatCount(display.visits),
    }
  }, [chatSnapshot.threads.length, matchSnapshot.matches.length, persisted.likesSent, persisted.profileVisits])

  return <ProfileStatsContext.Provider value={value}>{children}</ProfileStatsContext.Provider>
}

export function useProfileStats() {
  const ctx = useContext(ProfileStatsContext)
  if (!ctx) {
    throw new Error('useProfileStats must be used within ProfileStatsProvider')
  }
  return ctx
}
