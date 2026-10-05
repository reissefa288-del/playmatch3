import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthSession } from '../auth/useAuthSession'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import {
  disableUserLocationSharing,
  requestDeviceLocation,
  saveUserLocation,
} from './firestoreLocation'
import type { UserGeoPoint } from './locationTypes'

/** ADIM 10.3 — KVKK konum rızası + paylaşım durumu */
export function useLocationSharing() {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null
  const [coords, setCoords] = useState<UserGeoPoint | null>(null)
  const [sharingEnabled, setSharingEnabled] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setCoords(null)
      setSharingEnabled(false)
      setCity(null)
      return
    }

    const db = getFirestoreDb()
    if (!db || !isFirebaseConfigured()) return

    let cancelled = false
    void getDoc(doc(db, 'users', uid)).then((snap) => {
      if (cancelled || !snap.exists()) return
      const data = snap.data() as {
        locationSharingEnabled?: boolean
        geo?: UserGeoPoint | null
        city?: string
      }
      setSharingEnabled(data.locationSharingEnabled === true)
      setCoords(data.geo?.latitude != null ? data.geo : null)
      setCity(data.city ?? null)
    })

    return () => {
      cancelled = true
    }
  }, [uid])

  const openConsent = useCallback(() => setConsentOpen(true), [])
  const closeConsent = useCallback(() => setConsentOpen(false), [])

  const enableSharing = useCallback(async () => {
    if (!uid) return false
    setLoading(true)
    setError(null)
    try {
      const position = await requestDeviceLocation()
      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      await saveUserLocation(uid, nextCoords, city ?? undefined)
      setCoords(nextCoords)
      setSharingEnabled(true)
      setConsentOpen(false)
      return true
    } catch {
      setError('Konum alınamadı. Tarayıcı iznini kontrol edip tekrar dene.')
      return false
    } finally {
      setLoading(false)
    }
  }, [city, uid])

  const disableSharing = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    setError(null)
    try {
      await disableUserLocationSharing(uid)
      setSharingEnabled(false)
      setCoords(null)
    } finally {
      setLoading(false)
    }
  }, [uid])

  return {
    coords,
    city,
    sharingEnabled,
    loading,
    consentOpen,
    error,
    openConsent,
    closeConsent,
    enableSharing,
    disableSharing,
  }
}
