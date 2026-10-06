import { getFirebaseAuth } from '../auth/firebaseApp'
import { onAuthStateChanged } from 'firebase/auth'
import { findCheckInPlace, type CheckInPlace } from './checkInPlaces'
import { CHECK_IN_WINDOW_MS, clearRemoteCheckIn, publishCheckIn } from './firestoreCheckIn'

const STORAGE_KEY = 'pm-check-in'

type StoredCheckIn = {
  id: string
  checkedInAt: number
}

let dropRemoteOnAuth = false
let current: StoredCheckIn | null = readStored()
const listeners = new Set<() => void>()

function readStored(): StoredCheckIn | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as StoredCheckIn
      if (!parsed?.id || !findCheckInPlace(parsed.id)) return null
      if (Date.now() >= parsed.checkedInAt + CHECK_IN_WINDOW_MS) {
        dropRemoteOnAuth = true
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        return null
      }
      return { id: parsed.id, checkedInAt: parsed.checkedInAt }
    }
    return findCheckInPlace(raw) ? { id: raw, checkedInAt: Date.now() } : null
  } catch {
    return null
  }
}

function persist(next: StoredCheckIn | null) {
  try {
    if (!next) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function uidNow(): string | null {
  return getFirebaseAuth()?.currentUser?.uid ?? null
}

export function subscribeCheckIn(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCheckInSnapshot(): string | null {
  return current?.id ?? null
}

export function getCheckInCheckedInAt(): number | null {
  return current?.checkedInAt ?? null
}

export function getCheckedInPlace(): CheckInPlace | null {
  return findCheckInPlace(current?.id)
}

export function checkInAt(place: CheckInPlace) {
  if (!findCheckInPlace(place.id)) return
  const checkedInAt = Date.now()
  current = { id: place.id, checkedInAt }
  persist(current)
  emit()
  const uid = uidNow()
  if (uid) void publishCheckIn(uid, place, checkedInAt).catch(() => undefined)
}

export function leaveCheckIn() {
  const uid = uidNow()
  current = null
  persist(null)
  emit()
  if (uid) void clearRemoteCheckIn(uid)
}

function expireIfNeeded() {
  if (!current) return
  if (Date.now() < current.checkedInAt + CHECK_IN_WINDOW_MS) return
  leaveCheckIn()
}

const auth = getFirebaseAuth()
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (dropRemoteOnAuth && user) {
      dropRemoteOnAuth = false
      void clearRemoteCheckIn(user.uid)
    }
    expireIfNeeded()
    if (!user || !current) return
    const place = findCheckInPlace(current.id)
    if (!place) return
    void publishCheckIn(user.uid, place, current.checkedInAt).catch(() => undefined)
  })
}

if (typeof window !== 'undefined') {
  window.setInterval(expireIfNeeded, 30_000)
}
