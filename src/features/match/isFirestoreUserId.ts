/** Firebase Auth uid'leri genelde 20+ karakter; mock bot id'leri kısa string. */
export function isFirestoreUserId(id: string): boolean {
  return id.length >= 20
}
