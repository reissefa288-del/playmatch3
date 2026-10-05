# ADIM 1.3 — Firebase Console Kurulumu (Sen)

Bu adım **Firebase Console** üzerinde yapılır. Aşağıdaki sırayı takip et; bitince doğrula:

```powershell
npm run firebase:verify-setup
```

---

## 1. Proje oluştur

1. [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Proje adı: `PlayMeet` (veya `playmeet-prod`)
3. Google Analytics: isteğe bağlı (kapalı test için şart değil)
4. Oluşan **Project ID**'yi not al (ör. `playmeet-prod-a1b2c`)

---

## 2. Web uygulaması ekle

1. Project Overview → **Web** (`</>`)
2. App nickname: `PlayMeet Web`
3. **Firebase Hosting** kutusunu işaretle
4. Register app → **config** değerlerini kopyala:

| Console alanı | `.env.production` anahtarı |
|---------------|----------------------------|
| apiKey | `VITE_FIREBASE_API_KEY` |
| authDomain | `VITE_FIREBASE_AUTH_DOMAIN` |
| projectId | `VITE_FIREBASE_PROJECT_ID` |
| storageBucket | `VITE_FIREBASE_STORAGE_BUCKET` |
| messagingSenderId | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| appId | `VITE_FIREBASE_APP_ID` |

5. **ADIM 1.4** — env + project id (otomatik):

```powershell
npm run firebase:init-env
```

İlk çalıştırma `firebase/firebase-web-config.json` oluşturur. Firebase Console → Web app **config** JSON'unu bu dosyaya yapıştır, komutu tekrar çalıştır.

Manuel alternatif:

```powershell
copy .env.production.example .env.production
# Değerleri yapıştır + .firebaserc project id
```

---

## 3. Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method → Google → Enable**
3. Project support email seç
4. **Settings → Authorized domains**:
   - `localhost`
   - `playmeet-prod-1bbda.web.app`
   - `playmeet-prod-1bbda.firebaseapp.com`

5. **Google Cloud Console** → APIs & Services → **Credentials** → Web client (Firebase tarafından oluşturulan):

   **Authorized JavaScript origins** (girişi hangi adresten açıyorsan hepsi):
   - `http://localhost:5173`
   - `https://playmeet-prod-1bbda.web.app`
   - `https://playmeet-prod-1bbda.firebaseapp.com`

   **Authorized redirect URIs** (handler — eksikse sekme handler’da takılı kalır):
   - `https://playmeet-prod-1bbda.firebaseapp.com/__/auth/handler`

   OAuth consent screen **Publishing status: In production** (veya test kullanıcı listesi).

---

## 4. Firestore Database

1. **Build → Firestore Database → Create database**
2. **Production mode** seç (rules repo'dan deploy edilecek)
3. **Location:** `eur3 (Europe)` veya `europe-west1` — Türkiye için uygun
4. Enable

Uygulamanın kullandığı koleksiyonlar (ilk kullanımda otomatik oluşur):

- `users`, `likes`, `matches`, `matches/{id}/messages`
- `dailyLikes`, `reports`, `blocks`, `fcmTokens`

**Composite index:** repo'dan deploy edilir (`firebase/firestore.indexes.json`):

```powershell
# deploy:p0-backend veya deploy:firebase indexes dahil eder
npm run deploy:p0-backend
```

Keşfet (`onboardingCompleted` + `uid`) ve yakındakiler (`geohash`) için gerekli.

---

## 5. Storage

1. **Build → Storage → Get started**
2. **Production mode** seç
3. Aynı bölgeyi Firestore ile uyumlu seç
4. Default bucket oluşur → `VITE_FIREBASE_STORAGE_BUCKET` ile eşleşmeli

Yol yapısı: `users/{uid}/photos/{fileName}`

---

## 6. Hosting (ön hazırlık)

Hosting ilk `firebase deploy` ile aktif olur. Console'da şimdilik:

1. **Build → Hosting** sayfasını aç
2. "Get started" görürsen adımları atlayabilirsin — deploy CLI ile yapılacak

---

## 7. (İsteğe bağlı) Android app — TWA için

ADIM 2'de gerekir; şimdilik atlayabilirsin:

- Package: `app.playmeet.twa`
- Upload key SHA-1 + SHA-256 (keystore sonrası)

---

## Bitince kontrol

```powershell
npm run firebase:verify-setup
npm run validate:firebase
npm run env:check:production
```

Hepsi yeşilse → **ADIM 1.4** tamam sayılır (env + project id) → **ADIM 1.5** deploy:

```powershell
npx firebase login
npx firebase use <project-id>
npm run deploy:firebase
```

---

## Sık hatalar

| Sorun | Çözüm |
|-------|--------|
| Google giriş `auth/unauthorized-domain` | Authorized domains'e Hosting URL ekle |
| Storage upload 403 | `npm run deploy:rules` çalıştır |
| Firestore permission denied | Rules deploy + kullanıcı giriş yapmış olmalı |
| `firebase: command not found` | `npm install` (firebase-tools devDep) veya `npx firebase` kullan |
