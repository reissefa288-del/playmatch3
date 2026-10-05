import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import { dailyLikesDayKey } from '../../shared/dailyLikes'
import type { FirestoreDailyLikesDocument } from '../match/matchFirestoreTypes'

const COLLECTION = 'dailyLikes'

export async function readFirestoreDailyLikes(uid: string): Promise<number> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return 0

  const today = dailyLikesDayKey()
  const snap = await getDoc(doc(db, COLLECTION, uid))
  if (!snap.exists()) return 0

  const data = snap.data() as FirestoreDailyLikesDocument
  return data.date === today ? data.count : 0
}
