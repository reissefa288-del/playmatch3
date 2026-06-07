export type PremiumSubscription = {
  active: boolean
  activatedAt: number | null
  packageId: string | null
}

const STORAGE_KEY = 'pm-premium-subscription'

export function createInactiveSubscription(): PremiumSubscription {
  return {
    active: false,
    activatedAt: null,
    packageId: null,
  }
}

export function readPremiumSubscriptionRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function readPremiumSubscription(): PremiumSubscription {
  const raw = readPremiumSubscriptionRaw()
  if (!raw) return createInactiveSubscription()
  try {
    const parsed = JSON.parse(raw) as PremiumSubscription
    return parsed?.active ? parsed : createInactiveSubscription()
  } catch {
    return createInactiveSubscription()
  }
}

export function writePremiumSubscription(subscription: PremiumSubscription) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription))
  } catch {
    /* ignore */
  }
}

export function isPremiumActive(): boolean {
  return readPremiumSubscription().active === true
}

export function activatePremium(packageId: string) {
  writePremiumSubscription({
    active: true,
    activatedAt: Date.now(),
    packageId,
  })
}
