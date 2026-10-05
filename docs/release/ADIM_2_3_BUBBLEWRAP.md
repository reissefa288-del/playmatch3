# ADIM 2.3 — Bubblewrap Init + AAB Build

## Ön koşullar

- ADIM 1.5 deploy (canlı HTTPS)
- ADIM 2.2 keystore + assetlinks fingerprint + `deploy:hosting`
- JDK 17+, Android SDK ([Android Studio](https://developer.android.com/studio) veya command-line tools)

```powershell
npx @bubblewrap/cli doctor
npm run twa:preflight-build
```

---

## 1. Bubblewrap init (ilk kez, etkileşimli)

```powershell
npm run twa:init
```

Canlı manifest henüz yoksa:

```powershell
npm run twa:init -- --local-manifest
```

Terminal sorularında `android/twa-manifest.json` değerlerini kullan:

| Soru | Değer |
|------|-------|
| Host | `twa-host.json` → host |
| Package ID | `app.playmeet.twa` |
| App name | PlayMeet |
| Theme / background | `#060818` |

Init sonrası init script PlayMeet `twa-manifest.json` ayarlarını geri yükler ve `update` çalıştırır.

---

## 2. Signing config

```powershell
copy android\signingKey.properties.example android\signingKey.properties
```

`storePassword` ve `keyPassword` → keystore şifren (ADIM 2.2).

---

## 3. Release AAB

```powershell
npm run twa:build
```

Çıktı örneği:

- `android/app-release-bundle.aab`
- veya `android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Play Console yükleme

1. Internal testing veya Closed testing track oluştur
2. AAB yükle
3. Sıradaki: **ADIM 2.4** (listing, Data Safety, rating)

---

## Komut özeti

| Komut | Açıklama |
|-------|----------|
| `npm run twa:preflight-build` | JDK/SDK, keystore, fingerprint kontrolü |
| `npm run twa:init` | İlk Bubblewrap projesi |
| `npm run twa:build` | İmzalı AAB |

---

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| `doctor` invalid SDK | Android Studio SDK Manager → API 34+ |
| TWA açılmıyor (browser) | assetlinks deploy + fingerprint doğru mu |
| `signingKey.properties` | Example kopyala, şifreleri doldur |
| Google Sign-In | ADIM 2.5 notları + Authorized domains |
