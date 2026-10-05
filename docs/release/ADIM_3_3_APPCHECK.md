# ADIM 3.3 — Firebase App Check

App Check, Firebase API'lerine giden isteklerin gerçek uygulamadan geldiğini doğrular.

## Client (repo — tamamlandı)

- `src/features/auth/firebaseAppCheck.ts` — reCAPTCHA v3 provider
- Firebase app başlatılırken otomatik `initFirebaseAppCheck()`

## Senin yapman gerekenler (Firebase Console)

### 1. reCAPTCHA v3 site key

1. [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) → **v3**
2. Domain: Hosting domain'in (`playmeet.app`, `*.web.app`, `localhost` dev için)
3. Site key → `.env.production`:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
```

### 2. Firebase App Check kaydı

1. Firebase Console → **App Check**
2. Web app → **reCAPTCHA v3** → site key yapıştır
3. Önce **Monitoring** modunda bırak (1–2 gün metrik izle)
4. Sorunsuzsa **Enforce**:
   - Cloud Firestore
   - Cloud Storage
   - Authentication (opsiyonel, dikkatli)

### 3. Local dev (debug token)

1. App Check → Web app → **Manage debug tokens**
2. Token oluştur → `.env.local`:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

`npm run dev` — Console'da debug token görünür.

## Ortam değişkenleri

| Değişken | Ortam | Zorunlu |
|----------|-------|---------|
| `VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY` | production | Enforce öncesi evet |
| `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` | local dev | Opsiyonel |

## Doğrula

```powershell
npm run validate:app-check
npm run build
npm run deploy:hosting
```

Enforce sonrası: uygulama açılmadan Firestore 403 alıyorsan site key veya domain yanlış.

## TWA (Android)

TWA web SDK kullanır → **reCAPTCHA v3** yeterli. Play Integrity yalnızca native Android SDK için.

## Rules (ADIM 3.6 — repo)

Firestore + Storage `isSignedIn()` artık `request.app != null` gerektirir. Detay: **`ADIM_3_6_APPCHECK_RULES.md`**

Deploy sırası: **`ADIM_3_7_ENFORCE_DEPLOY.md`** (Faz A → B → C)

## Deploy sırası (özet)

1. Site key → `.env.production` → `deploy:hosting`
2. Console App Check monitoring
3. 2 hesap test (`CLOSED_TEST_PLAN.md`)
4. Console enforce
5. Rules deploy — **`ADIM_3_6_APPCHECK_RULES.md`**

---

Sıradaki: **ADIM 3.4** — `npm run deploy:rules` + 2 hesap test
