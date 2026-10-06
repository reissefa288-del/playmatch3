import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import { createMuratpasaCheckInBot, shouldUseGameTestBot } from '../games/gameTestBot'
import { mapFirestoreUserToMatchProfile } from '../match/mapDiscoverProfile'
import { isPartnerBlocked } from '../moderation/blocksStore'
import type { FirestoreUserDocument } from '../profile/types'
import type { MatchProfile } from '../match/data'
import { districtPlace, type CheckInPlace } from './checkInPlaces'

const CHECK_INS = 'checkIns'

/** Swarm’daki “burada” penceresi: check-in 3 saat görünür. */
export const CHECK_IN_WINDOW_MS = 3 * 60 * 60 * 1000

export type HerePerson = {
  profile: MatchProfile
  checkedInAt: number
}

const MURATPASA_ID = districtPlace('Antalya', 'Muratpaşa')?.id ?? ''
const MURATPASA_BOT_AT = Date.now() - 60 * 60 * 1000

type CheckInRecord = {
  uid: string
  placeId: string
  venue: string
  city: string
  district: string
  checkedInAt: number
  expiresAt: number
}

export async function publishCheckIn(uid: string, place: CheckInPlace, checkedInAt: number): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return
  const expiresAt = checkedInAt + CHECK_IN_WINDOW_MS
  if (expiresAt <= Date.now()) return

  await setDoc(doc(db, CHECK_INS, uid), {
    uid,
    placeId: place.id,
    venue: place.district,
    city: place.city,
    district: place.district,
    checkedInAt,
    expiresAt,
  } satisfies CheckInRecord)
}

export async function clearRemoteCheckIn(uid: string): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return
  await deleteDoc(doc(db, CHECK_INS, uid)).catch(() => undefined)
}

function toHereProfile(user: FirestoreUserDocument, place: { city: string; district: string }): MatchProfile {
  const profile = mapFirestoreUserToMatchProfile(user)
  const spot = place.district ? `${place.district}, ${place.city}` : place.city
  return {
    ...profile,
    province: place.city,
    distance: 'Burada',
    location: spot,
    online: true,
  }
}

function withDistrictBot(placeId: string, people: HerePerson[]): HerePerson[] {
  if (!shouldUseGameTestBot() || placeId !== MURATPASA_ID) return people
  if (people.some((person) => person.profile.id === 'bot-checkin-muratpasa')) return people
  return [...people, { profile: createMuratpasaCheckInBot(), checkedInAt: MURATPASA_BOT_AT }]
}

function byNewest(people: HerePerson[]): HerePerson[] {
  return [...people].sort((a, b) => b.checkedInAt - a.checkedInAt)
}

/** İlçede şu an check-in’i açık olan kişiler. En son check-in üstte. Kendin hariç. */
export function subscribePeopleHere(
  placeId: string,
  viewerUid: string | null,
  onChange: (people: HerePerson[]) => void,
): Unsubscribe {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    onChange(byNewest(withDistrictBot(placeId, [])))
    return () => undefined
  }

  const peopleQuery = query(collection(db, CHECK_INS), where('placeId', '==', placeId))
  let generation = 0

  return onSnapshot(
    peopleQuery,
    (snap) => {
      const current = ++generation
      const now = Date.now()
      const rows = snap.docs
        .map((entry) => entry.data() as CheckInRecord)
        .filter((row) => row.expiresAt > now && row.uid && row.uid !== viewerUid && !isPartnerBlocked(row.uid))

      void Promise.all(
        rows.map(async (row) => {
          const userSnap = await getDoc(doc(db, 'users', row.uid))
          if (!userSnap.exists()) return null
          const data = userSnap.data() as FirestoreUserDocument
          if (data.onboardingCompleted !== true) return null
          return {
            profile: toHereProfile(
              { ...data, uid: data.uid || row.uid },
              { city: row.city, district: row.district },
            ),
            checkedInAt: row.checkedInAt,
          } satisfies HerePerson
        }),
      ).then((profiles) => {
        if (current !== generation) return
        const people = profiles.filter((person): person is HerePerson => person !== null)
        onChange(byNewest(withDistrictBot(placeId, people)))
      })
    },
    () => onChange(byNewest(withDistrictBot(placeId, []))),
  )
}
