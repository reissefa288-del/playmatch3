import { subscribePeopleHere, type HerePerson } from './firestoreCheckIn'

export type VenuePresence = {
  placeId: string | null
  people: HerePerson[]
  ready: boolean
}

const EMPTY: VenuePresence = { placeId: null, people: [], ready: true }

let snapshot: VenuePresence = EMPTY
let watchedPlaceId: string | null = null
let watchedUid: string | null = null
let unsubscribe: (() => void) | null = null
const listeners = new Set<() => void>()

function emit(next: VenuePresence) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function subscribeVenuePresence(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getVenuePresenceSnapshot(): VenuePresence {
  return snapshot
}

export function getVenuePresenceServerSnapshot(): VenuePresence {
  return EMPTY
}

export function watchVenuePresence(placeId: string | null, viewerUid: string | null) {
  if (watchedPlaceId === placeId && watchedUid === viewerUid) return
  watchedPlaceId = placeId
  watchedUid = viewerUid
  unsubscribe?.()
  unsubscribe = null

  if (!placeId) {
    emit(EMPTY)
    return
  }

  emit({ placeId, people: [], ready: false })
  unsubscribe = subscribePeopleHere(placeId, viewerUid, (people) => {
    if (watchedPlaceId !== placeId) return
    emit({ placeId, people, ready: true })
  })
}
