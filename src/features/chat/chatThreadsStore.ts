import type { MatchProfile } from '../match/data'
import { matchDocId } from '../match/firestoreMatch'
import { isFirebaseConfigured } from '../auth/firebaseApp'
import { isPartnerBlocked } from '../moderation/blocksStore'
import type { ChatThread } from './data'
import { formatMessageClock } from './chatTime'
import {
  markInboundMessagesRead,
  type FirestoreChatMessage,
} from './firestoreChat'
import { subscribeSharedMatchMessages } from './matchMessageListeners'

type MatchThreadState = {
  partnerUid: string
  matchId: string
  profile: MatchProfile
  messages: FirestoreChatMessage[]
}

export type ChatThreadsSnapshot = {
  threads: ChatThread[]
  loading: boolean
  uid: string | null
}

let snapshot: ChatThreadsSnapshot = {
  threads: [],
  loading: false,
  uid: null,
}

const listeners = new Set<() => void>()
const messageUnsubs = new Map<string, () => void>()
let threadStates = new Map<string, MatchThreadState>()
let activeUid: string | null = null
let activePartnerUid: string | null = null

function emit() {
  listeners.forEach((listener) => listener())
}

function setSnapshot(next: ChatThreadsSnapshot) {
  snapshot = next
  emit()
}

function buildThread(uid: string, state: MatchThreadState): ChatThread {
  const last = state.messages[state.messages.length - 1]
  const unread = state.messages.filter(
    (message) => message.senderUid !== uid && message.readAt == null,
  ).length

  return {
    id: state.partnerUid,
    matchId: state.matchId,
    name: state.profile.name,
    lastMessage: last?.text ?? 'Sohbeti başlat',
    time: last ? formatMessageClock(last.createdAt) : '',
    unread: unread > 0 ? unread : undefined,
    isOnline: state.profile.online,
    verified: state.profile.verified,
    highlighted: unread > 0,
    portraitSrc: state.profile.portraitSrc,
    portraitPosition: state.profile.photos[0]?.objectPosition ?? '50% 12%',
  }
}

function recomputeThreads(uid: string) {
  const threads = [...threadStates.values()]
    .map((state) => buildThread(uid, state))
    .sort((a, b) => {
      const aLast = threadStates.get(a.matchId)?.messages.at(-1)?.createdAt ?? 0
      const bLast = threadStates.get(b.matchId)?.messages.at(-1)?.createdAt ?? 0
      return bLast - aLast
    })

  setSnapshot({
    threads,
    loading: false,
    uid,
  })
}

function clearMessageListeners() {
  messageUnsubs.forEach((unsub) => unsub())
  messageUnsubs.clear()
  threadStates = new Map()
}

export function bindChatThreads(uid: string | null, matches: MatchProfile[]) {
  if (!uid || !isFirebaseConfigured()) {
    clearMessageListeners()
    activeUid = null
    activePartnerUid = null
    setSnapshot({ threads: [], loading: false, uid: null })
    return
  }

  if (activeUid !== uid) {
    clearMessageListeners()
    activeUid = uid
  }

  const nextMatchIds = new Set<string>()

  for (const profile of matches) {
    if (isPartnerBlocked(profile.id)) continue
    const matchId = matchDocId(uid, profile.id)
    nextMatchIds.add(matchId)

    if (messageUnsubs.has(matchId)) {
      const existing = threadStates.get(matchId)
      if (existing) {
        threadStates.set(matchId, { ...existing, profile })
      }
      continue
    }

    threadStates.set(matchId, {
      partnerUid: profile.id,
      matchId,
      profile,
      messages: [],
    })

    const unsub = subscribeSharedMatchMessages(matchId, (messages) => {
      const state = threadStates.get(matchId)
      if (!state) return
      threadStates.set(matchId, { ...state, messages })
      recomputeThreads(uid)

      if (activePartnerUid && activePartnerUid === state.partnerUid) {
        void markInboundMessagesRead(matchId, uid, messages)
      }
    })

    messageUnsubs.set(matchId, unsub)
  }

  for (const [matchId, unsub] of messageUnsubs) {
    if (!nextMatchIds.has(matchId)) {
      unsub()
      messageUnsubs.delete(matchId)
      threadStates.delete(matchId)
    }
  }

  recomputeThreads(uid)
}

export function setActiveChatPartner(partnerUid: string | null) {
  activePartnerUid = partnerUid
  if (!activeUid || !partnerUid) return

  const state = [...threadStates.values()].find((entry) => entry.partnerUid === partnerUid)
  if (!state) return

  void markInboundMessagesRead(state.matchId, activeUid, state.messages)
}

export function subscribeChatThreads(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getChatThreadsSnapshot(): ChatThreadsSnapshot {
  return snapshot
}

export function getThreadStateForPartner(partnerUid: string): MatchThreadState | null {
  return [...threadStates.values()].find((state) => state.partnerUid === partnerUid) ?? null
}
