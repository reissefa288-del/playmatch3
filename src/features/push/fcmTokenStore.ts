import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '../auth/firebaseApp'
import { isTwaOrStandalone } from '../auth/androidTwa'

const USERS = 'users'
const FCM_TOKENS = 'fcmTokens'

export type FcmPlatform = 'web' | 'twa'

export function detectFcmPlatform(): FcmPlatform {
  if (isTwaOrStandalone()) return 'twa'
  return 'web'
}

function hashToken(token: string): string {
  let hash = 5381
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 33) ^ token.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

export async function saveFcmToken(uid: string, token: string, platform: FcmPlatform): Promise<void> {
  const db = getFirestoreDb()
  if (!db) return

  const tokenId = hashToken(token)
  const now = Date.now()
  await setDoc(
    doc(db, USERS, uid, FCM_TOKENS, tokenId),
    {
      token,
      platform,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  )
}

export async function removeFcmToken(uid: string, token: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db) return

  const tokenId = hashToken(token)
  await deleteDoc(doc(db, USERS, uid, FCM_TOKENS, tokenId)).catch(() => undefined)
}
