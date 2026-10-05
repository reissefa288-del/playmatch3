import type { Unsubscribe } from 'firebase/firestore'
import {
  subscribeRecentMatchMessages,
  type FirestoreChatMessage,
} from './firestoreChat'

type MessageListener = (messages: FirestoreChatMessage[]) => void

type SharedSubscription = {
  messages: FirestoreChatMessage[]
  listeners: Set<MessageListener>
  unsub: Unsubscribe
}

const subscriptions = new Map<string, SharedSubscription>()

/** ADIM 6.2 — eşleşme başına tek Firestore listener */
export function subscribeSharedMatchMessages(
  matchId: string,
  listener: MessageListener,
  onError?: (error: Error) => void,
): () => void {
  let entry = subscriptions.get(matchId)

  if (!entry) {
    const listeners = new Set<MessageListener>()
    const unsub = subscribeRecentMatchMessages(
      matchId,
      (messages) => {
        const sub = subscriptions.get(matchId)
        if (!sub) return
        sub.messages = messages
        sub.listeners.forEach((fn) => fn(messages))
      },
      onError,
    )
    entry = { messages: [], listeners, unsub }
    subscriptions.set(matchId, entry)
  }

  entry.listeners.add(listener)
  if (entry.messages.length > 0) {
    listener(entry.messages)
  }

  return () => {
    const sub = subscriptions.get(matchId)
    if (!sub) return
    sub.listeners.delete(listener)
    if (sub.listeners.size === 0) {
      sub.unsub()
      subscriptions.delete(matchId)
    }
  }
}

export function getSharedMatchMessages(matchId: string): FirestoreChatMessage[] | null {
  return subscriptions.get(matchId)?.messages ?? null
}

export function releaseSharedMatchMessages(matchId: string): void {
  const sub = subscriptions.get(matchId)
  if (!sub || sub.listeners.size > 0) return
  sub.unsub()
  subscriptions.delete(matchId)
}
