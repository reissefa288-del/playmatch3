# P0 — Android uygulama paketi (TWA → AAB)

Play Store kapalı/açık test için imzalı **AAB** üretimi.

---

## Durum

```powershell
npm run p0:android:status
```

---

## Ön koşullar

| # | Gereksinim |
|---|------------|
| 1 | JDK 17+ (`java -version`) |
| 2 | Android SDK (`npx @bubblewrap/cli doctor` → valid) |
| 3 | Canlı HTTPS (P0 backend) — assetlinks için `npm run deploy:hosting` |

Host Firebase `.web.app` ise:

```powershell
# android/twa-host.json → "host": "proje-id.web.app"
npm run twa:sync-host
```

---

## Tek komut (2.2 + 2.3)

```powershell
npm run deploy:p0-android
```

Sıra:

1. **Keystore** oluştur (`android/playmeet-upload.keystore`) — şifre `android/.twa-secrets.local`
2. **SHA-256** → `assetlinks.json` + `twa-manifest.json`
3. **Bubblewrap init** (ilk kez, `--local-manifest`)
4. **AAB build**

Sadece imzalama (keystore + fingerprint):

```powershell
npm run deploy:p0-android -- --signing-only
npm run deploy:hosting
npm run deploy:p0-android -- --skip-init
```

---

## Manuel adımlar (2.2)

Keystore şifresini kendin belirlemek için:

```powershell
$env:TWA_KEYSTORE_PASSWORD="guclu-sifren"
npm run twa:setup-signing
```

Keystore yedekle — **kaybedersen Play güncellemesi yapamazsın.**

---

## Deploy assetlinks (zorunlu)

TWA’nın tarayıcı yerine uygulama açması için:

```powershell
npm run deploy:hosting
```

Doğrula: `https://<host>/.well-known/assetlinks.json`

---

## Firebase Console

Project settings → Add app → **Android**

- Package: `app.playmeet.twa`
- SHA-1 + SHA-256 (upload key) — `npm run twa:fingerprint` çıktısı

---

## Play Console (2.4 + 2.6 — sen)

| Adım | Rehber |
|------|--------|
| Store listing, ekran görüntüsü | `ADIM_2_4_PLAY_CONSOLE.md` |
| Data Safety | `DATA_SAFETY.md` |
| Internal / Closed test | `ADIM_2_6_CLOSED_TEST.md` |
| AAB yükle | `android/app/build/outputs/bundle/release/` veya script çıktısı |

Gerekli URL’ler:

- Gizlilik: `https://<host>/legal/gizlilik-politikasi`
- Kullanım: `https://<host>/legal/kullanim-kosullari`

---

## Komut özeti

```powershell
npm run p0:android:status
npm run twa:setup-signing
npm run twa:init -- --local-manifest
npm run twa:build
npm run deploy:p0-android
```

---

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| TWA browser’da açılıyor | assetlinks deploy + fingerprint eşleşmesi |
| `doctor` invalid SDK | Android Studio → SDK Manager API 34+ |
| Google Sign-In TWA | `ADIM_2_5_ANDROID_AUTH.md` + Authorized domains |
| Init canlı manifest 404 | `--local-manifest` kullan |
