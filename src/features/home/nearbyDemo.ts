import { isFirebaseConfigured } from '../auth/firebaseApp'

/** ADIM 10.1 — mock yakındakiler demo modu */
export function shouldUseNearbyDemoData(
  hasRealLocation: boolean,
  realCount: number,
): boolean {
  if (!isFirebaseConfigured()) return true
  if (!hasRealLocation) return true
  return realCount === 0
}

export const NEARBY_DEMO_LABEL = 'Demo veriler'

export const NEARBY_DEMO_HINT =
  'Kapalı testte gösterilen profiller örnektir. Gerçek yakındaki oyuncular için konum paylaşımını aç.'
