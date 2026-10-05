# ADIM 4.3 — dailyLikes Server Increment

Günlük beğeni kotası artık **client yazamaz** — yalnızca Cloud Function.

## Callable

`consumeDailyLike` (region: `europe-west1`)

- Auth zorunlu
- Transaction ile `dailyLikes/{uid}` increment
- Limit: 10/gün (`DAILY_LIKES_LIMIT`)
- Limit aşımı → `resource-exhausted`

## Client

Like öncesi `tryConsumeDailyLike()` → callable çağrısı.

CF yok / unavailable → localStorage fallback (dev).

## Rules

```javascript
match /dailyLikes/{userId} {
  allow read: if isOwner(userId);
  allow create, update, delete: if false;
}
```

## Deploy

```powershell
npm run deploy:functions
npm run deploy:security
```

## Test

| # | Senaryo | Beklenen |
|---|---------|----------|
| DL1 | 10 like gönder | OK |
| DL2 | 11. like | Reddedilir |
| DL3 | Console client write dailyLikes | Deny |
| DL4 | Ertesi gün | Sayaç sıfır |

---

Sıradaki agent: **ADIM 4.4** ✅ (aynı deploy paketi)
