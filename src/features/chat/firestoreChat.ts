import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import { isEitherUserBlocked } from '../moderation/firestoreModeration'
import { matchDocId } from '../match/firestoreMatch'
import { CHAT_MESSAGES_PAGE_SIZE } from './chatConstants'
import { assertChatSendAllowed, recordChatSend } from './chatSendRateLimit'

const MATCHES = 'matches'

export type FirestoreChatMessage = {
  id: string
  senderUid: string
  text: string
  createdAt: number
  readAt: number | null
}

export type FirestoreChatMessageInput = {
  senderUid: string
  text: string
  createdAt: number
  readAt: number | null
}

export async function isValidMatchChat(viewerUid: string, partnerUid: string): Promise<boolean> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return false
  if (await isEitherUserBlocked(viewerUid, partnerUid)) return false
  const id = matchDocId(viewerUid, partnerUid)
  const snap = await getDoc(doc(db, MATCHES, id))
  return snap.exists()
}

function mapMessageDoc(entry: QueryDocumentSnapshot): FirestoreChatMessage {
  const data = entry.data() as FirestoreChatMessageInput
  return {
    id: entry.id,
    senderUid: data.senderUid,
    text: data.text,
    createdAt: data.createdAt,
    readAt: data.readAt ?? null,
  }
}

/** ADIM 6.1 — son N mesaj (desc limit, UI için kronolojik) */
export function subscribeRecentMatchMessages(
  matchId: string,
  onChange: (messages: FirestoreChatMessage[]) => void,
  onError?: (error: Error) => void,
  pageSize = CHAT_MESSAGES_PAGE_SIZE,
): Unsubscribe {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    onChange([])
    return () => {}
  }

  const q = query(
    collection(db, MATCHES, matchId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(mapMessageDoc).reverse()
      onChange(messages)
    },
    (error) => onError?.(error),
  )
}

/** @deprecated use subscribeRecentMatchMessages or subscribeSharedMatchMessages */
export function subscribeMatchMessages(
  matchId: string,
  onChange: (messages: FirestoreChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return subscribeRecentMatchMessages(matchId, onChange, onError)
}

export async function fetchOlderMatchMessages(
  matchId: string,
  beforeCreatedAt: number,
  pageSize = CHAT_MESSAGES_PAGE_SIZE,
): Promise<{ messages: FirestoreChatMessage[]; hasMore: boolean }> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    return { messages: [], hasMore: false }
  }

  const q = query(
    collection(db, MATCHES, matchId, 'messages'),
    where('createdAt', '<', beforeCreatedAt),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )

  const snapshot = await getDocs(q)
  const messages = snapshot.docs.map(mapMessageDoc).reverse()
  return {
    messages,
    hasMore: snapshot.size >= pageSize,
  }
}

export async function sendMatchMessage(
  matchId: string,
  senderUid: string,
  text: string,
  partnerUid?: string,
): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }

  if (partnerUid && (await isEitherUserBlocked(senderUid, partnerUid))) {
    throw new Error('Engellenen kullanıcıya mesaj gönderilemez.')
  }

  const trimmed = text.trim()
  if (!trimmed) return

  assertChatSendAllowed()

  await addDoc(collection(db, MATCHES, matchId, 'messages'), {
    senderUid,
    text: trimmed,
    createdAt: Date.now(),
    readAt: null,
  } satisfies FirestoreChatMessageInput)

  recordChatSend()
}

export async function markInboundMessagesRead(
  matchId: string,
  readerUid: string,
  messages: FirestoreChatMessage[],
): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return

  const unread = messages.filter(
    (message) => message.senderUid !== readerUid && message.readAt == null,
  )
  if (unread.length === 0) return

  const batch = writeBatch(db)
  const now = Date.now()
  for (const message of unread) {
    batch.update(doc(db, MATCHES, matchId, 'messages', message.id), { readAt: now })
  }
  await batch.commit()
}
