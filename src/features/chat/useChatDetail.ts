import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { matchDocId } from '../match/firestoreMatch'
import { useMatchConnections } from '../match/useMatchConnections'
import type { ChatDetail } from './data'
import { mapFirestoreMessagesToUi } from './mapChatMessages'
import {
  getThreadStateForPartner,
  setActiveChatPartner,
} from './chatThreadsStore'
import {
  fetchOlderMatchMessages,
  isValidMatchChat,
  markInboundMessagesRead,
  sendMatchMessage,
  type FirestoreChatMessage,
} from './firestoreChat'
import {
  getSharedMatchMessages,
  subscribeSharedMatchMessages,
} from './matchMessageListeners'
import { ChatSendRateLimitError } from './chatSendRateLimit'

function mergeMessages(
  older: FirestoreChatMessage[],
  recent: FirestoreChatMessage[],
): FirestoreChatMessage[] {
  const byId = new Map<string, FirestoreChatMessage>()
  for (const message of [...older, ...recent]) {
    byId.set(message.id, message)
  }
  return [...byId.values()].sort((a, b) => a.createdAt - b.createdAt)
}

export function useChatDetail(partnerUid: string | undefined) {
  const { session } = useAuthSession()
  const viewerUid = session?.uid ?? null
  const { matches, loading: matchesLoading } = useMatchConnections()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [recentMessages, setRecentMessages] = useState<FirestoreChatMessage[]>([])
  const [olderMessages, setOlderMessages] = useState<FirestoreChatMessage[]>([])
  const [hasOlderMessages, setHasOlderMessages] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const loadingOlderRef = useRef(false)

  const profile = partnerUid ? matches.find((match) => match.id === partnerUid) : undefined
  const matchId =
    viewerUid && partnerUid ? matchDocId(viewerUid, partnerUid) : null

  useEffect(() => {
    if (!viewerUid || !partnerUid) {
      setAllowed(false)
      return
    }

    let cancelled = false
    void isValidMatchChat(viewerUid, partnerUid).then((ok) => {
      if (!cancelled) setAllowed(ok)
    })

    return () => {
      cancelled = true
    }
  }, [viewerUid, partnerUid])

  useEffect(() => {
    if (!partnerUid) return
    setActiveChatPartner(partnerUid)
    return () => setActiveChatPartner(null)
  }, [partnerUid])

  useEffect(() => {
    setOlderMessages([])
    setRecentMessages([])
    setHasOlderMessages(true)
    setSendError(null)
  }, [matchId])

  useEffect(() => {
    if (!viewerUid || !matchId || allowed !== true) {
      setRecentMessages([])
      return
    }

    const cached = getSharedMatchMessages(matchId)
    if (cached) {
      setRecentMessages(cached)
    } else {
      const threadState = partnerUid ? getThreadStateForPartner(partnerUid) : null
      if (threadState) {
        setRecentMessages(threadState.messages)
      }
    }

    const unsub = subscribeSharedMatchMessages(matchId, (nextMessages) => {
      setRecentMessages(nextMessages)
      void markInboundMessagesRead(matchId, viewerUid, nextMessages)
    })

    return unsub
  }, [allowed, matchId, partnerUid, viewerUid])

  const loadOlderMessages = useCallback(async () => {
    if (!matchId || loadingOlderRef.current) return

    const combined = mergeMessages(olderMessages, recentMessages)
    const oldest = combined[0]
    if (!oldest) {
      setHasOlderMessages(false)
      return
    }

    loadingOlderRef.current = true
    setLoadingOlder(true)
    try {
      const page = await fetchOlderMatchMessages(matchId, oldest.createdAt)
      if (page.messages.length === 0) {
        setHasOlderMessages(false)
        return
      }
      setOlderMessages((current) => mergeMessages(page.messages, current))
      setHasOlderMessages(page.hasMore)
    } finally {
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }
  }, [matchId, olderMessages, recentMessages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!viewerUid || !matchId || !text.trim()) return
      setSending(true)
      setSendError(null)
      try {
        await sendMatchMessage(matchId, viewerUid, text, partnerUid)
      } catch (error) {
        if (error instanceof ChatSendRateLimitError) {
          setSendError(error.message)
        } else {
          throw error
        }
      } finally {
        setSending(false)
      }
    },
    [matchId, partnerUid, viewerUid],
  )

  const messages = viewerUid
    ? mapFirestoreMessagesToUi(mergeMessages(olderMessages, recentMessages), viewerUid)
    : []

  const chat: ChatDetail | null =
    allowed && profile && partnerUid && matchId
      ? {
          id: partnerUid,
          matchId,
          name: profile.name,
          verified: profile.verified,
          isOnline: profile.online,
          portraitSrc: profile.portraitSrc,
          portraitPosition: profile.photos[0]?.objectPosition ?? '50% 12%',
          lastGame: {
            title: profile.favoriteGames[0]?.label ?? 'PlayMeet',
            emoji: profile.favoriteGames[0]?.emoji ?? '🎮',
            playedAgo: 'Yakın zamanda',
          },
          messages,
        }
      : null

  return {
    chat,
    allowed,
    loading: allowed === null || matchesLoading,
    sending,
    sendError,
    sendMessage,
    loadOlderMessages,
    hasOlderMessages,
    loadingOlder,
  }
}
