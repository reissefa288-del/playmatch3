# ADIM 8.2 — Play Billing + Firestore Entitlement

Premium satın alma: TWA Digital Goods API → Cloud Function → `users/{uid}.premium`.

---

## Firestore şeması

```typescript
users/{uid}.premium = {
  active: boolean
  productId: string | null      // playmeet_premium_3m vb.
  expiresAt: number | null      // unix ms
  source: 'play' | 'stub' | null
  updatedAt: number
}
```

Günlük beğeni kotası (`consumeDailyLike`) sunucuda `premium.active` kontrol eder.

---

## İstemci

| Dosya | Rol |
|-------|-----|
| `playBillingBridge.ts` | TWA `getDigitalGoodsService` |
| `firestorePremium.ts` | `syncPremiumEntitlement` callable |
| `premiumEntitlementStore.ts` | Oturum cache |
| `usePremiumSubscription.ts` | UI → satın alma |

### Stub mod (geliştirme)

`.env.production`:

```env
VITE_PREMIUM_ENABLED=true
VITE_PREMIUM_STUB_PURCHASES=true
```

TWA olmadan Play Billing simülasyonu için.

---

## Cloud Function

`syncPremiumEntitlement` — kapalı testte token stub kabul eder.  
**Production:** Google Play Developer API ile `purchaseToken` doğrulaması eklenmeli.

---

## Senin adımların (8.3)

1. Play Console → Merchant + abonelik ürünleri (`playmeet_premium_1m`, `_3m`, `_12m`)
2. TWA rebuild (`enableNotifications` + billing delegation)
3. Internal test satın alma
4. `VITE_PREMIUM_ENABLED=true` ile hosting deploy

---

## Deploy

```powershell
npm run deploy:functions   # syncPremiumEntitlement
npm run deploy:firebase
```
