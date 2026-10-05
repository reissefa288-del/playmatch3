import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import type { FirestoreBlockDocument, FirestoreReportDocument, ReportSource } from './moderationTypes'

const REPORTS = 'reports'
const BLOCKS = 'blocks'
const LIKES = 'likes'
const DAILY_LIKES = 'dailyLikes'
const USERS = 'users'

export function blockDocId(blockerUid: string, blockedUid: string): string {
  return `${blockerUid}_${blockedUid}`
}

export async function submitUserReport(input: {
  reporterUid: string
  targetUid: string
  reason: string
  details: string
  source: ReportSource
}): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }
  if (input.reporterUid === input.targetUid) {
    throw new Error('Kendini şikayet edemezsin.')
  }

  const reportId = `${input.reporterUid}_${input.targetUid}_${Date.now()}`
  await setDoc(doc(db, REPORTS, reportId), {
    reporterUid: input.reporterUid,
    targetUid: input.targetUid,
    reason: input.reason.trim(),
    details: input.details.trim(),
    createdAt: Date.now(),
    source: input.source,
  } satisfies FirestoreReportDocument)
}

export async function blockUser(blockerUid: string, blockedUid: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }
  if (blockerUid === blockedUid) return

  await setDoc(doc(db, BLOCKS, blockDocId(blockerUid, blockedUid)), {
    blockerUid,
    blockedUid,
    createdAt: Date.now(),
  } satisfies FirestoreBlockDocument)
}

export async function fetchBlockedPartnerUids(uid: string): Promise<Set<string>> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return new Set()

  const [outgoing, incoming] = await Promise.all([
    getDocs(query(collection(db, BLOCKS), where('blockerUid', '==', uid))),
    getDocs(query(collection(db, BLOCKS), where('blockedUid', '==', uid))),
  ])

  const partners = new Set<string>()
  outgoing.forEach((entry) => {
    const data = entry.data() as FirestoreBlockDocument
    partners.add(data.blockedUid)
  })
  incoming.forEach((entry) => {
    const data = entry.data() as FirestoreBlockDocument
    partners.add(data.blockerUid)
  })
  return partners
}

export async function isEitherUserBlocked(uidA: string, uidB: string): Promise<boolean> {
  const blocked = await fetchBlockedPartnerUids(uidA)
  return blocked.has(uidB)
}

export async function deleteUserOutgoingLikes(uid: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db) return

  const snap = await getDocs(query(collection(db, LIKES), where('fromUid', '==', uid)))
  if (snap.empty) return

  const batch = writeBatch(db)
  snap.forEach((entry) => batch.delete(entry.ref))
  await batch.commit()
}

export async function deleteUserBlocks(uid: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db) return

  const snap = await getDocs(query(collection(db, BLOCKS), where('blockerUid', '==', uid)))
  if (snap.empty) return

  const batch = writeBatch(db)
  snap.forEach((entry) => batch.delete(entry.ref))
  await batch.commit()
}

export async function deleteFirestoreUserRecord(uid: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return
  const batch = writeBatch(db)
  batch.delete(doc(db, USERS, uid))
  batch.delete(doc(db, DAILY_LIKES, uid))
  await batch.commit()
}
