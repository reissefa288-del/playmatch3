# PlayMeet Android — TWA (Trusted Web Activity)

## Karar: TWA (Bubblewrap), Capacitor değil

| Kriter | TWA | Capacitor |
|--------|-----|-----------|
| Kurulum süresi | 1–2 gün | 4–6 gün |
| Mevcut PWA uyumu | Tam | İyi |
| Google Sign-In (`signInWithPopup`) | Chrome tabanlı — TWA'da redirect fallback | WebView — sık sorun |
| Play Billing (ileride) | Ek native katman gerekir | Plugin ile kolay |
| Bakım maliyeti | Düşük | Orta |

Kapalı test için **TWA** seçildi. Premium/IAP sonraya bırakıldı.

## Sabitler

| Alan | Değer |
|------|-------|
| Package ID | `app.playmeet.twa` |
| Uygulama adı | PlayMeet |
| Host | `playmeet.app` (Firebase Hosting domain'iniz) |
| Min SDK | Bubblewrap default (23+) |

## ADIM 2.1 — Şablon kontrolü

```powershell
npm run twa:sync-host
npm run validate:twa
```

Host farklıysa `android/twa-host.json` güncelle (ör. `project-id.web.app`). Detay: `docs/release/TWA_CHECKLIST.md`.

## Ön koşullar

1. `npm run deploy:firebase` — canlı HTTPS + manifest + assetlinks
2. JDK 17+, Android SDK, `npm i -g @bubblewrap/cli`
3. `.well-known/assetlinks.json` içinde upload key SHA-256

## Signing key stratejisi

1. **Upload key** (Play App Signing): bir kez oluştur, yedekle
2. Google Play **App Signing** etkin — Google dağıtım anahtarını yönetir
3. Keystore asla repoya commit edilmez (`.gitignore` korumalı)

```powershell
keytool -genkeypair -v -keystore android/playmeet-upload.keystore -alias playmeet -keyalg RSA -keysize 2048 -validity 10000
```

SHA-256 çıkar + assetlinks güncelle (otomatik):

```powershell
npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet
npm run twa:apply-fingerprint
npm run validate:twa
npm run deploy:hosting
```

Detay: `docs/release/ADIM_2_2_KEYSTORE.md`

## Build komutları (ADIM 2.3)

```powershell
npm run twa:preflight-build
npm run twa:init
copy android\signingKey.properties.example android\signingKey.properties
# signingKey.properties şifreleri doldur
npm run twa:build
```

Detay: `docs/release/ADIM_2_3_BUBBLEWRAP.md`

Manuel alternatif:

```powershell
cd android
npx @bubblewrap/cli init --manifest=https://playmeet.app/manifest.webmanifest
npx @bubblewrap/cli build
```

## Firebase Android app

Firebase Console → Project settings → Add app → Android:

- Package name: `app.playmeet.twa`
- SHA-1 ve SHA-256 (upload key) ekle
- `google-services.json` gerekmez (Firebase Web SDK kullanılıyor)

## Play Console

1. Internal testing veya Closed testing track
2. `app-release-bundle.aab` yükle
3. Data Safety + Privacy URL: `https://playmeet.app/legal/gizlilik-politikasi`
4. Content rating: Dating/Social, 18+

Detay: `docs/release/` klasörü.
