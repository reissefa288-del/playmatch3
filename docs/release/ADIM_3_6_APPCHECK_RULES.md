# ADIM 3.6 — App Check Rules (`hasAppCheck`)

Firestore ve Storage kuralları artık geçerli App Check token'ı olmadan **hiçbir authenticated işleme** izin vermez.

## Değişiklik

Her iki rules dosyasında:

```javascript
function hasAppCheck() {
  return request.app != null;
}

function isSignedIn() {
  return request.auth != null && hasAppCheck();
}
```

Tüm `isSignedIn()` / `isOwner()` zinciri otomatik App Check gerektirir.

## ⚠️ Deploy sırası (kritik)

Rules **3.6'dan önce** deploy edilirse ve client App Check göndermiyorsa → tüm Firestore/Storage **403**.

Doğru sıra:

1. reCAPTCHA site key → `.env.production`
2. `npm run deploy:hosting` (client App Check init canlıda)
3. Firebase Console → App Check → **Monitoring** (1–2 gün)
4. Console → Firestore + Storage → **Enforce**
5. `npm run security:preflight` (site key zorunlu)
6. `npm run deploy:security`
7. 2 hesap test (`SECURITY_TEST_CHECKLIST.md` S8–S9)

**3.6 rules deploy'u, hosting + Console enforce olmadan yapma.**

## Local dev

`.env.local`:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Console → App Check → Manage debug tokens → token ekle.

Rules deploy edilmiş projede local test için debug token şart.

## Doğrula

```powershell
npm run validate:firestore-rules
npm run validate:storage-rules
npm run validate:app-check
npm run security:preflight
```

`security:preflight` site key yoksa **deploy'u durdurur** (3.6 rules aktifken).

## Test

| # | Senaryo | Beklenen |
|---|---------|----------|
| AC1 | Production URL, giriş + keşfet | OK |
| AC2 | App Check token olmadan REST/SDK isteği | 403 |
| AC3 | TWA giriş + foto upload | OK |
| AC4 | Local dev debug token ile | OK |

## Geri alma

Acil durumda Console'da App Check enforce kapat veya geçici olarak rules'dan `hasAppCheck()` kaldırıp redeploy (önerilmez).

---

**ADIM 3** tamamlandı sayılır: 3.4 test + 3.6 deploy + AC1–AC3 geçti.

Sıradaki: **ADIM 3.7** (sen — `ADIM_3_7_ENFORCE_DEPLOY.md`)
