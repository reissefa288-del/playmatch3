import { isTwaOrStandalone } from '../auth/androidTwa'
import { PLAY_PREMIUM_SKUS, syncPremiumPurchase } from './firestorePremium'

declare global {
  interface Window {
    getDigitalGoodsService?: (serviceProvider: string) => Promise<DigitalGoodsService>
  }
}

type DigitalGoodsService = {
  getDetails: (itemIds: string[]) => Promise<{ itemDetails: Array<{ itemId: string; price: string }> }>
  listPurchases: () => Promise<{ purchaseDetails: Array<{ itemId: string; purchaseToken: string }> }>
}

const PLAY_BILLING_URL = 'https://play.google.com/billing'

function isStubPurchasesEnabled(): boolean {
  return import.meta.env.VITE_PREMIUM_STUB_PURCHASES === 'true'
}

/** ADIM 8.2 — TWA Digital Goods / stub satın alma köprüsü */
export async function purchasePremiumPackage(
  uid: string,
  packageId: string,
): Promise<void> {
  const sku = PLAY_PREMIUM_SKUS[packageId] ?? `playmeet_premium_${packageId}`

  if (typeof window.getDigitalGoodsService === 'function' && isTwaOrStandalone()) {
    const service = await window.getDigitalGoodsService(PLAY_BILLING_URL)
    await service.getDetails([sku])
    const purchases = await service.listPurchases()
    const existing = purchases.purchaseDetails.find((entry) => entry.itemId === sku)
    if (existing?.purchaseToken) {
      await syncPremiumPurchase(uid, sku, existing.purchaseToken)
      return
    }
    throw new Error('Play satın alma tamamlanmadı. Play Store ödeme ekranını kontrol et.')
  }

  if (isStubPurchasesEnabled()) {
    await syncPremiumPurchase(uid, sku, `stub-${Date.now()}`)
    return
  }

  throw new Error('Premium satın alma yalnızca Android TWA veya stub modunda kullanılabilir.')
}

export function isPlayBillingAvailable(): boolean {
  return typeof window.getDigitalGoodsService === 'function' || isStubPurchasesEnabled()
}
