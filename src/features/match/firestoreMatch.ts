import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import type { FirestoreLikeDocument, FirestoreMatchDocument, MatchSource } from './matchFirestoreTypes'
import { fetchBlockedPartnerUids } from '../moderation/firestoreModeration'
import type { FirestoreUserDocument } from '../profile/types'
import { mapFirestoreUserToMatchProfile } from './mapDiscoverProfile'
import type { MatchProfile } from './data'

export { fetchDiscoverProfiles, fetchDiscoverProfilesPage } from './discoverFetch'
export type { DiscoverPageCursor, DiscoverPageResult } from './discoverFetch'

const USERS = 'users'
const LIKES = 'likes'
const MATCHES = 'matches'

export function likeDocId(fromUid: string, toUid: string): string {
  return `${fromUid}_${toUid}`
}

export function matchDocId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_')
}

export async function fetchOutgoingLikeTargets(fromUid: string): Promise<Set<string>> {
  const db = getFirestoreDb()
  if (!db) return new Set()

  const snap = await getDocs(query(collection(db, LIKES), where('fromUid', '==', fromUid)))
  const targets = new Set<string>()
  snap.forEach((entry) => {
    const data = entry.data() as FirestoreLikeDocument
    targets.add(data.toUid)
  })
  return targets
}

export async function fetchMatchedPartnerUids(uid: string): Promise<Set<string>> {
  const db = getFirestoreDb()
  if (!db) return new Set()

  const [asA, asB] = await Promise.all([
    getDocs(query(collection(db, MATCHES), where('userA', '==', uid))),
    getDocs(query(collection(db, MATCHES), where('userB', '==', uid))),
  ])

  const partners = new Set<string>()
  asA.forEach((entry) => {
    const data = entry.data() as FirestoreMatchDocument
    partners.add(data.userB)
  })
  asB.forEach((entry) => {
    const data = entry.data() as FirestoreMatchDocument
    partners.add(data.userA)
  })
  return partners
}

export async function fetchMatchDocuments(uid: string): Promise<FirestoreMatchDocument[]> {
  const db = getFirestoreDb()
  if (!db) return []

  const [asA, asB] = await Promise.all([
    getDocs(query(collection(db, MATCHES), where('userA', '==', uid))),
    getDocs(query(collection(db, MATCHES), where('userB', '==', uid))),
  ])

  const byId = new Map<string, FirestoreMatchDocument>()
  for (const entry of [...asA.docs, ...asB.docs]) {
    byId.set(entry.id, entry.data() as FirestoreMatchDocument)
  }
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt)
}

export async function fetchMatchProfiles(uid: string): Promise<MatchProfile[]> {
  const db = getFirestoreDb()
  if (!db) return []

  const [docs, blockedPartners] = await Promise.all([
    fetchMatchDocuments(uid),
    fetchBlockedPartnerUids(uid),
  ])
  const profiles: MatchProfile[] = []

  for (const match of docs) {
    const partnerUid = match.userA === uid ? match.userB : match.userA
    if (blockedPartners.has(partnerUid)) continue
    const userSnap = await getDoc(doc(db, USERS, partnerUid))
    if (!userSnap.exists()) continue
    profiles.push(
      mapFirestoreUserToMatchProfile({
        ...(userSnap.data() as FirestoreUserDocument),
        uid: partnerUid,
      }),
    )
  }

  return profiles
}

const MATCH_WAIT_ATTEMPTS = 12
const MATCH_WAIT_MS = 350

async function waitForMatchDoc(uidA: string, uidB: string): Promise<boolean> {
  const db = getFirestoreDb()
  if (!db) return false

  const ref = doc(db, MATCHES, matchDocId(uidA, uidB))
  for (let attempt = 0; attempt < MATCH_WAIT_ATTEMPTS; attempt += 1) {
    const snap = await getDoc(ref)
    if (snap.exists()) return true
    await new Promise((resolve) => window.setTimeout(resolve, MATCH_WAIT_MS))
  }
  return false
}

export type SendLikeResult = {
  matched: boolean
  createdMatch: boolean
}

export async function sendFirestoreLike(
  fromUid: string,
  toUid: string,
  source: MatchSource,
): Promise<SendLikeResult> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }
  if (fromUid === toUid) {
    throw new Error('Kendini beğenemezsin.')
  }

  const likeRef = doc(db, LIKES, likeDocId(fromUid, toUid))
  const existingLike = await getDoc(likeRef)
  if (!existingLike.exists()) {
    await setDoc(likeRef, {
      fromUid,
      toUid,
      createdAt: Date.now(),
      source,
    } satisfies FirestoreLikeDocument)
  }

  const reverse = await getDoc(doc(db, LIKES, likeDocId(toUid, fromUid)))
  if (!reverse.exists()) {
    return { matched: false, createdMatch: false }
  }

  const matched = await waitForMatchDoc(fromUid, toUid)
  return { matched, createdMatch: matched }
}

export async function hasFirestoreLike(fromUid: string, toUid: string): Promise<boolean> {
  const db = getFirestoreDb()
  if (!db) return false
  const snap = await getDoc(doc(db, LIKES, likeDocId(fromUid, toUid)))
  return snap.exists()
}
