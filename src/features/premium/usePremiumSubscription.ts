import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  activatePremium as persistPremium,
  readPremiumSubscription,
  readPremiumSubscriptionRaw,
} from './premiumSubscription'
import { notifyDailyLikesSyncChanged } from '../likes/dailyLikesSync'

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

export function usePremiumSubscriptionState() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return readPremiumSubscription()
}

export function usePremiumSubscriptionActions() {
  const activatePremium = useCallback((packageId: string) => {
    persistPremium(packageId)
    emit()
    notifyDailyLikesSyncChanged()
  }, [])

  return useMemo(() => ({ activatePremium }), [activatePremium])
}

export function usePremiumSubscription() {
  const subscription = usePremiumSubscriptionState()
  const { activatePremium } = usePremiumSubscriptionActions()
  return {
    subscription,
    isPremiumActive: subscription.active,
    activatePremium,
  }
}

export function notifyPremiumSubscriptionChanged() {
  emit()
}
