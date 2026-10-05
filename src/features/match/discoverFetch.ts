import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import type { FirestoreUserDocument } from '../profile/types'
import { inferUserGender } from '../profile/userGender'
import type { MatchGenderFilter } from './types'
import type { MatchProfile } from './data'
import { mapFirestoreUserToMatchProfile } from './mapDiscoverProfile'
import {
  buildDiscoverExcludedUids,
  getDiscoverExcludeSets,
  type DiscoverExcludeSets,
} from './discoverExcludeCache'
import {
  DISCOVER_BATCH_TARGET,
  DISCOVER_QUERY_PAGE_SIZE,
} from './discoverConstants'

const USERS = 'users'

export type DiscoverPageCursor = QueryDocumentSnapshot | null

export type DiscoverPageResult = {
  profiles: MatchProfile[]
  nextCursor: DiscoverPageCursor
  hasMore: boolean
}

function mapDiscoverDoc(
  entry: QueryDocumentSnapshot,
  gender: MatchGenderFilter,
  excluded: Set<string>,
): MatchProfile | null {
  const data = entry.data() as FirestoreUserDocument
  const uid = data.uid ?? entry.id
  if (excluded.has(uid)) return null

  const userGender = data.gender ?? inferUserGender(data.matchPreference)
  if (userGender !== gender) return null

  return mapFirestoreUserToMatchProfile({ ...data, uid })
}

/** ADIM 5.1 — sayfalı keşfet (Firestore limit + cursor) */
export async function fetchDiscoverProfilesPage(
  viewerUid: string,
  gender: MatchGenderFilter,
  cursor: DiscoverPageCursor = null,
  excludeSets?: DiscoverExcludeSets,
): Promise<DiscoverPageResult> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    return { profiles: [], nextCursor: null, hasMore: false }
  }

  const sets = excludeSets ?? (await getDiscoverExcludeSets(viewerUid))
  const excluded = buildDiscoverExcludedUids(viewerUid, sets)

  const profiles: MatchProfile[] = []
  let pageCursor = cursor
  let hasMore = true
  let scans = 0
  const maxScans = 4

  while (profiles.length < DISCOVER_BATCH_TARGET && hasMore && scans < maxScans) {
    scans += 1
    let pageQuery = query(
      collection(db, USERS),
      where('onboardingCompleted', '==', true),
      orderBy('uid'),
      limit(DISCOVER_QUERY_PAGE_SIZE),
    )

    if (pageCursor) {
      pageQuery = query(
        collection(db, USERS),
        where('onboardingCompleted', '==', true),
        orderBy('uid'),
        startAfter(pageCursor),
        limit(DISCOVER_QUERY_PAGE_SIZE),
      )
    }

    const snap = await getDocs(pageQuery)
    if (snap.empty) {
      hasMore = false
      break
    }

    for (const entry of snap.docs) {
      const profile = mapDiscoverDoc(entry, gender, excluded)
      if (profile) profiles.push(profile)
    }

    pageCursor = snap.docs[snap.docs.length - 1] ?? null
    hasMore = snap.size >= DISCOVER_QUERY_PAGE_SIZE
  }

  profiles.sort((a, b) => a.name.localeCompare(b.name, 'tr'))

  return {
    profiles,
    nextCursor: pageCursor,
    hasMore,
  }
}

/** İlk yükleme — exclude cache doldurur */
export async function fetchDiscoverProfiles(
  viewerUid: string,
  gender: MatchGenderFilter,
): Promise<MatchProfile[]> {
  const sets = await getDiscoverExcludeSets(viewerUid)
  const page = await fetchDiscoverProfilesPage(viewerUid, gender, null, sets)
  return page.profiles
}
