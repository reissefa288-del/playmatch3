# ADIM 4.1 — Cloud Functions Projesi

Firebase Cloud Functions (Gen 2, TypeScript, Node 20) scaffold.

## Yapı

```
functions/
  package.json
  tsconfig.json
  src/
    index.ts              # export health (+ 4.2+ trigger'lar)
    lib/
      firebaseAdmin.ts    # Admin SDK init
      ids.ts              # likeDocId, matchDocId (client ile uyumlu)
    types/
      firestore.ts        # Firestore doküman tipleri
```

`firebase.json` → `functions` predeploy: `npm run build`

## Doğrula

```powershell
cd functions
npm install
cd ..
npm run validate:functions
```

## Health endpoint (deploy sonrası)

Region: `europe-west1`

```
GET https://europe-west1-<project-id>.cloudfunctions.net/health
→ { "ok": true, "service": "playmeet-functions", "region": "europe-west1" }
```

## Local emulator (opsiyonel)

```powershell
npx firebase emulators:start --only functions
```

## Sıradaki agent adımları

| Kod | İş |
|-----|-----|
| **4.2** | `onLikeCreated` → mutual-like match gate ✅ |
| **4.3** | `consumeDailyLike` callable ✅ |
| **4.4** | `cascadeDeleteAccount` auth trigger ✅ |

Client karşılığı: `src/features/match/firestoreMatch.ts` (`sendFirestoreLike`, `ensureMatch`)

## Deploy (ADIM 4.5 — sen)

Blaze plan gerekli:

```powershell
npm run functions:preflight
npm run deploy:functions
```

---

Sıradaki agent: **ADIM 5.1** (keşfet pagination)
