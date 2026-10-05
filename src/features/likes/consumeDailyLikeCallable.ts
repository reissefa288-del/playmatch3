import { getFunctions, httpsCallable, type Functions } from 'firebase/functions'
import { getFirebaseApp, isFirebaseConfigured } from '../auth/firebaseApp'

const FUNCTIONS_REGION = 'europe-west1'

let functionsInstance: Functions | null = null

export function getFirebaseFunctions(): Functions | null {
  if (!isFirebaseConfigured()) return null
  const app = getFirebaseApp()
  if (!app) return null
  if (!functionsInstance) {
    functionsInstance = getFunctions(app, FUNCTIONS_REGION)
  }
  return functionsInstance
}

export type ConsumeDailyLikeResponse = {
  count: number
  remaining: number
  limit: number
}

export async function callConsumeDailyLike(): Promise<ConsumeDailyLikeResponse | null> {
  const functions = getFirebaseFunctions()
  if (!functions) return null

  const callable = httpsCallable<void, ConsumeDailyLikeResponse>(functions, 'consumeDailyLike')
  const result = await callable()
  return result.data
}

function isResourceExhausted(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error != null &&
    'code' in error &&
    String((error as { code: string }).code).includes('resource-exhausted')
  )
}

export async function tryServerConsumeDailyLike(): Promise<'ok' | 'limit' | 'unavailable'> {
  try {
    await callConsumeDailyLike()
    return 'ok'
  } catch (error) {
    if (isResourceExhausted(error)) return 'limit'
    return 'unavailable'
  }
}
