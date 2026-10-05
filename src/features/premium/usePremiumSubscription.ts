import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import {
  hydratePremiumEntitlement,
  readCachedPremiumEntitlement,
} from './premiumEntitlementStore'
import { isPremiumEntitlementActive } from './premiumEntitlementStore'
import { purchasePremiumPackage } from './playBillingBridge'
import { notifyDailyLikesSyncChanged } from '../likes/dailyLikesSync'

let listeners = new Set<() => void>()
let cacheTick = 0

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  cacheTick += 1
  listeners.forEach((listener) => listener())
}

function getSnapshot(): number {
  return cacheTick
}

export function usePremiumSubscriptionState() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const entitlement = readCachedPremiumEntitlement()
  return {
    active: isPremiumEntitlementActive(entitlement),
    activatedAt: entitlement.updatedAt || null,
    packageId: entitlement.productId,
  }
}

export function usePremiumSubscriptionActions() {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null

  const activatePremium = useCallback(
    async (packageId: string) => {
      if (!uid) throw new Error('Giriş gerekli.')
      await purchasePremiumPackage(uid, packageId)
      await hydratePremiumEntitlement(uid)
      emit()
      notifyDailyLikesSyncChanged()
    },
    [uid],
  )

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

export async function refreshPremiumForUser(uid: string | null): Promise<void> {
  await hydratePremiumEntitlement(uid)
  emit()
}
