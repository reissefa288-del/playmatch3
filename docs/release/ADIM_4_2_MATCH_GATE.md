# ADIM 4.2 — Mutual-Like Match Gate

Karşılıklı beğeni → `matches` dokümanı artık **yalnızca Cloud Function** oluşturur.

## Akış

```
Client: setDoc likes/{from_to}, { fromUid, toUid, source, createdAt }
    ↓
onLikeCreated (Firestore trigger)
    ↓
Karşı likes/{to_from} var mı? + block yok mu?
    ↓ evet
Transaction → matches/{sortedIds}
```

## Kod

| Dosya | Rol |
|-------|-----|
| `functions/src/triggers/onLikeCreated.ts` | Firestore trigger |
| `functions/src/lib/ensureMatch.ts` | Match + source merge |
| `src/features/match/firestoreMatch.ts` | Client sadece like yazar, match bekler |

## Rules değişikliği

- `matches` → `allow create, update: if false` (Admin SDK only)
- `likes` create → `source in ['discover', 'game']` zorunlu

## Client

`sendFirestoreLike` artık `ensureMatch` çağırmaz. Karşılıklı beğenide CF'nin match oluşturmasını ~4 sn polling ile bekler.

## Deploy sırası (4.5)

```powershell
npm run deploy:functions      # onLikeCreated
npm run deploy:security         # rules 4.2
```

Functions **rules'dan önce veya birlikte** deploy edilmeli — aksi halde mutual like match oluşturamaz.

## Test (2 hesap)

| # | Adım | Beklenen |
|---|------|----------|
| M1 | A → B like | Like kaydı, match yok |
| M2 | B → A like | Match oluşur (CF) |
| M3 | Eşleşmelerim | B görünür |
| M4 | Console'dan client match create | Deny (rules) |
| M5 | A engelledi B → like | Match oluşmaz |

## Emulator

```powershell
npx firebase emulators:start --only functions,firestore
```

---

Sıradaki agent: **ADIM 4.3** — dailyLikes server increment
