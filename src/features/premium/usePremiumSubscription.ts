import { useCallback, useSyncExternalStore } from 'react'
import {
  activatePremium as persistPremium,
  readPremiumSubscription,
  readPremiumSubscriptionRaw,
} from './premiumSubscription'

let listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot(): string | null {
  return readPremiumSubscriptionRaw()
}

export function usePremiumSubscription() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const subscription = readPremiumSubscription()

  const activatePremium = useCallback((packageId: string) => {
    persistPremium(packageId)
    emit()
  }, [])

  return {
    subscription,
    isPremiumActive: subscription.active,
    activatePremium,
  }
}

export function notifyPremiumSubscriptionChanged() {
  emit()
}
