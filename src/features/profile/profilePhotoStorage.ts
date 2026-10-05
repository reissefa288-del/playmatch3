import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '../auth/firebaseApp'

const PHOTO_SLOT_COUNT = 3

function extensionForMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

function extensionForFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  return extensionForMime(file.type)
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

function storagePath(uid: string, slot: number, ext: string): string {
  return `users/${uid}/photos/slot_${slot}_${Date.now()}.${ext}`
}

export async function uploadProfilePhotoFile(uid: string, slot: number, file: File): Promise<string> {
  const storage = getFirebaseStorage()
  if (!storage || !isFirebaseConfigured()) {
    throw new Error('Firebase Storage yapılandırması eksik.')
  }
  if (slot < 0 || slot >= PHOTO_SLOT_COUNT) {
    throw new Error('Geçersiz fotoğraf alanı.')
  }

  const path = storagePath(uid, slot, extensionForFile(file))
  const objectRef = ref(storage, path)
  await uploadBytes(objectRef, file, { contentType: file.type || undefined })
  return getDownloadURL(objectRef)
}

export async function uploadProfilePhotoDataUrl(uid: string, slot: number, dataUrl: string): Promise<string> {
  const blob = await dataUrlToBlob(dataUrl)
  const ext = extensionForMime(blob.type)
  const storage = getFirebaseStorage()
  if (!storage || !isFirebaseConfigured()) {
    throw new Error('Firebase Storage yapılandırması eksik.')
  }

  const path = storagePath(uid, slot, ext)
  const objectRef = ref(storage, path)
  await uploadBytes(objectRef, blob, { contentType: blob.type || undefined })
  return getDownloadURL(objectRef)
}

export function normalizePhotoUrls(photoUrl: string, photoUrls?: string[]): string[] {
  const base = photoUrls?.length ? [...photoUrls] : photoUrl ? [photoUrl] : []
  const slots: string[] = [null, null, null].map((_, index) => base[index] ?? '') as string[]
  return slots.map((url, index) => url || (index === 0 ? photoUrl : ''))
}
