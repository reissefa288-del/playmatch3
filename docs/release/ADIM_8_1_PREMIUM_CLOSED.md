# ADIM 8.1 — Premium Kapalı Test Modu

Kapalı test / production öncesi Premium satın alma **kapalı**.

## Varsayılan

Premium UI **açık** (dev + production). Kapalı testte gizlemek için:

```env
VITE_PREMIUM_ENABLED=false
```

## Kapalıyken (`VITE_PREMIUM_ENABLED=false`)

- Bottom nav **Premium sekmesi gizli**
- Ana sayfa **PremiumUnlockCard** gizli
- `/premium` → **Yakında** ekranı
- Oyun like limit toast → Premium butonu yok

## Açmak (8.2 — Play Billing)

Ek env gerekmez; UI zaten görünür. Billing için:

```env
VITE_PREMIUM_STUB_PURCHASES=true
```

`npm run deploy:hosting`

## Dosyalar

- `src/features/premium/premiumAvailability.ts`
- `src/features/premium/PremiumComingSoon.tsx`

---

Sıradaki agent: **ADIM 8.2** (Play Billing)
