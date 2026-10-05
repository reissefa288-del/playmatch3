# PlayMeet — Production Deploy Rehberi

## 1. Firebase projesi (ADIM 1.3)

Ayrıntılı Console adımları: **[FIREBASE_CONSOLE_SETUP.md](./FIREBASE_CONSOLE_SETUP.md)**

Özet: proje oluştur → Web app → Google Auth → Firestore → Storage → env doldur.

Doğrula:

```powershell
npm run firebase:verify-setup
```

## 2. Ortam değişkenleri

```powershell
copy .env.production.example .env.production
# Firebase web app config değerlerini doldur
```

Doğrula:

```powershell
npm run validate:firebase
npm run build:production
npm run env:check:production
```

`build:production` sonunda `validate:dist` otomatik çalışır (icons, assetlinks, sw.js, brotli).

`.firebaserc` içinde `YOUR_FIREBASE_PROJECT_ID` → gerçek project id.

## 3. Rules + Hosting deploy (ADIM 1.5)

Ayrıntılı: **[ADIM_1_5_DEPLOY.md](./ADIM_1_5_DEPLOY.md)**

```powershell
npm install
npx firebase login
npm run deploy:preflight
npm run deploy:firebase
```

Sadece rules:

```powershell
npm run deploy:rules
```

## 4. OAuth authorized domains

Firebase Console → Authentication → Settings → Authorized domains:

- `playmeet.app` (veya custom domain)
- `localhost` (dev)

## 5. Android OAuth

Firebase → Project settings → Android app (`app.playmeet.twa`):

- Upload key SHA-1 + SHA-256 ekle

## 6. assetlinks.json

1. Upload keystore oluştur (`android/README.md`)
2. SHA-256 → `public/.well-known/assetlinks.json`
3. `npm run deploy:hosting` (yeniden)

## Kontrol listesi

- [ ] `https://<domain>/` açılıyor
- [ ] `https://<domain>/manifest.webmanifest` ikonları içeriyor
- [ ] `https://<domain>/.well-known/assetlinks.json` erişilebilir
- [ ] Google giriş production'da çalışıyor
- [ ] Firestore rules test (2 hesap)
